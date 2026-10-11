<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export interface Candle {
    time: number; // Unix timestamp in seconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }

  export interface MarketStats {
    price: number | null;
    change24h: number | null;
    changePct24h: number | null;
    high24h: number | null;
    low24h: number | null;
    volume24h: number | null;
    vwap24h: number | null;
    bid: number | null;
    ask: number | null;
    spread: number | null;
    trades24h: number | null;
  }

  let {
    onPriceUpdate
  }: {
    onPriceUpdate?: (price: number, stats: MarketStats) => void;
  } = $props();

  // Selected chart timeframe: interval in minutes
  type Timeframe = '15' | '60' | '240' | '1440';
  let activeTimeframe = $state<Timeframe>('15');
  let chartType = $state<'area' | 'candles'>('area');

  // Market stats state
  let stats = $state<MarketStats>({
    price: null,
    change24h: null,
    changePct24h: null,
    high24h: null,
    low24h: null,
    volume24h: null,
    vwap24h: null,
    bid: null,
    ask: null,
    spread: null,
    trades24h: null
  });

  // Price direction flash
  let priceFlash = $state<'up' | 'down' | null>(null);
  let flashTimeout: any = null;

  // Chart data
  let candles = $state<Candle[]>([]);
  let chartLoading = $state(true);
  let wsConnected = $state(false);
  let isSyncing = $state(false);
  let lastUpdateText = $state<string>('Connecting...');

  // Tooltip / Hover state
  let hoveredCandle = $state<Candle | null>(null);
  let hoverX = $state<number | null>(null);
  let hoverY = $state<number | null>(null);

  // SVG Chart Dimensions
  const CHART_WIDTH = 640;
  const CHART_HEIGHT = 200;
  const PADDING_TOP = 18;
  const PADDING_BOTTOM = 24;
  const PADDING_LEFT = 10;
  const PADDING_RIGHT = 65;

  let ws: WebSocket | null = null;
  let pollInterval: any = null;
  let ohlcPollInterval: any = null;
  let reconnectTimeout: any = null;
  let isDestroyed = false;

  // Derived calculations for chart
  let chartMetrics = $derived.by(() => {
    if (!candles || candles.length === 0) {
      return { min: 0, max: 0, range: 1, points: [], lastCandle: null };
    }

    const visibleCandles = candles.slice(-40);
    const min = Math.min(...visibleCandles.map((c) => c.low));
    const max = Math.max(...visibleCandles.map((c) => c.high));
    const range = max - min || 1;
    const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;

    const points = visibleCandles.map((c, i) => {
      const x = PADDING_LEFT + (i / Math.max(visibleCandles.length - 1, 1)) * plotWidth;
      const y = PADDING_TOP + plotHeight - ((c.close - min) / range) * plotHeight;
      const yOpen = PADDING_TOP + plotHeight - ((c.open - min) / range) * plotHeight;
      const yHigh = PADDING_TOP + plotHeight - ((c.high - min) / range) * plotHeight;
      const yLow = PADDING_TOP + plotHeight - ((c.low - min) / range) * plotHeight;
      return { x, y, yOpen, yHigh, yLow, candle: c };
    });

    return {
      min,
      max,
      range,
      points,
      lastCandle: visibleCandles[visibleCandles.length - 1]
    };
  });

  // SVG Path generator for smooth area/line
  let areaPaths = $derived.by(() => {
    const pts = chartMetrics.points;
    if (pts.length < 2) return { line: '', area: '' };

    const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const baselineY = PADDING_TOP + plotHeight;

    let linePath = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cx = (prev.x + curr.x) / 2;
      linePath += ` C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
    }

    const firstX = pts[0].x.toFixed(1);
    const lastX = pts[pts.length - 1].x.toFixed(1);
    const areaPath = `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

    return { line: linePath, area: areaPath };
  });

  // Color theme: green if timeframe gained, red if dropped
  let isPositive = $derived.by(() => {
    if (stats.changePct24h !== null) return stats.changePct24h >= 0;
    if (candles.length >= 2) {
      return candles[candles.length - 1].close >= candles[0].close;
    }
    return true;
  });

  // 24h price position relative to range (0% to 100%)
  let rangePosition = $derived.by(() => {
    if (stats.price && stats.high24h && stats.low24h && stats.high24h > stats.low24h) {
      const pct = ((stats.price - stats.low24h) / (stats.high24h - stats.low24h)) * 100;
      return Math.min(Math.max(pct, 0), 100);
    }
    return 50;
  });

  function triggerPriceFlash(newPrice: number, oldPrice: number | null) {
    if (oldPrice === null) return;
    if (newPrice > oldPrice) {
      priceFlash = 'up';
    } else if (newPrice < oldPrice) {
      priceFlash = 'down';
    }
    if (flashTimeout) clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => {
      priceFlash = null;
    }, 700);
  }

  // Fetch REST ticker
  async function fetchTicker() {
    try {
      isSyncing = true;
      const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
      if (!res.ok) throw new Error('Ticker request failed');
      const data = await res.json();
      if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));

      const ticker = data.result.XXBTZUSD || data.result.XBTUSD;
      if (!ticker) return;

      const currentPrice = parseFloat(ticker.c[0]);
      const prevPrice = stats.price;
      const openPrice = parseFloat(ticker.o);
      const high24 = parseFloat(ticker.h[1]);
      const low24 = parseFloat(ticker.l[1]);
      const volume24 = parseFloat(ticker.v[1]);
      const vwap24 = parseFloat(ticker.p[1]);
      const bid = parseFloat(ticker.b[0]);
      const ask = parseFloat(ticker.a[0]);
      const trades24 = parseInt(ticker.t[1], 10);

      const change24 = currentPrice - openPrice;
      const changePct24 = openPrice ? (change24 / openPrice) * 100 : 0;
      const spread = ask && bid ? ask - bid : null;

      triggerPriceFlash(currentPrice, prevPrice);

      stats = {
        price: currentPrice,
        change24h: change24,
        changePct24h: changePct24,
        high24h: high24,
        low24h: low24,
        volume24h: volume24,
        vwap24h: vwap24,
        bid,
        ask,
        spread,
        trades24h: trades24
      };

      lastUpdateText = new Date().toLocaleTimeString();
      onPriceUpdate?.(currentPrice, stats);
    } catch (err) {
      console.error('Ticker fetch error:', err);
    } finally {
      isSyncing = false;
    }
  }

  // Fetch REST OHLC
  async function fetchOHLC(interval: Timeframe = activeTimeframe) {
    try {
      chartLoading = candles.length === 0;
      const res = await fetch(`https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=${interval}`);
      if (!res.ok) throw new Error('OHLC request failed');
      const data = await res.json();
      if (data.error && data.error.length > 0) throw new Error(data.error.join(', '));

      const pairKey = Object.keys(data.result).find((k) => k !== 'last');
      if (!pairKey) return;

      const rawCandles = data.result[pairKey];
      const parsedCandles: Candle[] = rawCandles.map((c: any) => ({
        time: c[0],
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        volume: parseFloat(c[6])
      }));

      candles = parsedCandles;

      // Update current price if available from latest candle and no stats yet
      if (parsedCandles.length > 0 && stats.price === null) {
        const last = parsedCandles[parsedCandles.length - 1];
        stats.price = last.close;
        onPriceUpdate?.(last.close, stats);
      }
    } catch (err) {
      console.error('OHLC fetch error:', err);
    } finally {
      chartLoading = false;
    }
  }

  // Switch timeframe
  function setTimeframe(tf: Timeframe) {
    if (activeTimeframe === tf) return;
    activeTimeframe = tf;
    hoveredCandle = null;
    fetchOHLC(tf);
    resubscribeWsOHLC();
  }

  // WebSocket Live Stream Setup
  function connectWebSocket() {
    if (isDestroyed) return;

    try {
      ws = new WebSocket('wss://ws.kraken.com/v2');

      ws.onopen = () => {
        if (isDestroyed) {
          ws?.close();
          return;
        }
        wsConnected = true;
        lastUpdateText = 'Streaming live';

        // Subscribe to ticker
        ws?.send(
          JSON.stringify({
            method: 'subscribe',
            params: {
              channel: 'ticker',
              symbol: ['BTC/USD']
            }
          })
        );

        // Subscribe to OHLC
        ws?.send(
          JSON.stringify({
            method: 'subscribe',
            params: {
              channel: 'ohlc',
              symbol: ['BTC/USD'],
              interval: Number(activeTimeframe)
            }
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.channel === 'ticker' && Array.isArray(msg.data)) {
            for (const item of msg.data) {
              if (item.last) {
                const newPrice = item.last;
                const prevPrice = stats.price;
                triggerPriceFlash(newPrice, prevPrice);

                stats = {
                  ...stats,
                  price: newPrice,
                  change24h: item.change ?? stats.change24h,
                  changePct24h: item.change_pct ?? stats.changePct24h,
                  high24h: item.high ?? stats.high24h,
                  low24h: item.low ?? stats.low24h,
                  volume24h: item.volume ?? stats.volume24h,
                  vwap24h: item.vwap ?? stats.vwap24h,
                  bid: item.bid ?? stats.bid,
                  ask: item.ask ?? stats.ask,
                  spread: item.ask && item.bid ? item.ask - item.bid : stats.spread,
                  trades24h: item.trades ?? stats.trades24h
                };

                lastUpdateText = new Date().toLocaleTimeString();
                onPriceUpdate?.(newPrice, stats);

                // Update the close of the latest candle in real time
                if (candles.length > 0) {
                  const lastIdx = candles.length - 1;
                  const currentLast = candles[lastIdx];
                  const updatedHigh = Math.max(currentLast.high, newPrice);
                  const updatedLow = Math.min(currentLast.low, newPrice);
                  candles[lastIdx] = {
                    ...currentLast,
                    close: newPrice,
                    high: updatedHigh,
                    low: updatedLow
                  };
                  candles = [...candles];
                }
              }
            }
          } else if (msg.channel === 'ohlc' && Array.isArray(msg.data)) {
            for (const item of msg.data) {
              const candleTime = Math.floor(new Date(item.interval_begin || item.timestamp).getTime() / 1000);
              const open = item.open;
              const high = item.high;
              const low = item.low;
              const close = item.close;
              const volume = item.volume ?? 0;

              if (candles.length > 0) {
                const last = candles[candles.length - 1];
                if (last.time === candleTime) {
                  candles[candles.length - 1] = { time: candleTime, open, high, low, close, volume };
                } else if (candleTime > last.time) {
                  candles = [...candles.slice(-99), { time: candleTime, open, high, low, close, volume }];
                }
              }
            }
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Kraken WebSocket encountered an error, falling back to REST poll:', err);
        wsConnected = false;
      };

      ws.onclose = () => {
        wsConnected = false;
        if (!isDestroyed) {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
    } catch (e) {
      wsConnected = false;
      console.warn('WebSocket connection attempt failed:', e);
    }
  }

  function resubscribeWsOHLC() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          method: 'subscribe',
          params: {
            channel: 'ohlc',
            symbol: ['BTC/USD'],
            interval: Number(activeTimeframe)
          }
        })
      );
    }
  }

  // Chart hover and touch interaction
  function updateHoverAtClientX(clientX: number, target: SVGElement) {
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0) return;
    const mouseX = clientX - rect.left;
    const svgX = (mouseX / rect.width) * CHART_WIDTH;
    const pts = chartMetrics.points;
    if (pts.length === 0) return;

    // Find nearest point along x
    let nearest = pts[0];
    let minDiff = Math.abs(svgX - pts[0].x);

    for (let i = 1; i < pts.length; i++) {
      const diff = Math.abs(svgX - pts[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = pts[i];
      }
    }

    hoveredCandle = nearest.candle;
    hoverX = nearest.x;
    hoverY = nearest.y;
  }

  function handleChartMouseMove(e: MouseEvent) {
    updateHoverAtClientX(e.clientX, e.currentTarget as SVGElement);
  }

  function handleChartTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      updateHoverAtClientX(e.touches[0].clientX, e.currentTarget as SVGElement);
    }
  }

  function handleChartLeave() {
    hoveredCandle = null;
    hoverX = null;
    hoverY = null;
  }

  function formatTime(timestampSec: number): string {
    const d = new Date(timestampSec * 1000);
    if (activeTimeframe === '1440') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  onMount(() => {
    fetchTicker();
    fetchOHLC('15');
    connectWebSocket();

    // Secondary backup polling
    pollInterval = setInterval(fetchTicker, 12000);
    ohlcPollInterval = setInterval(() => fetchOHLC(activeTimeframe), 45000);
  });

  onDestroy(() => {
    isDestroyed = true;
    if (ws) {
      ws.close();
      ws = null;
    }
    if (pollInterval) clearInterval(pollInterval);
    if (ohlcPollInterval) clearInterval(ohlcPollInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (flashTimeout) clearTimeout(flashTimeout);
  });
</script>

<div class="market-card">
  <!-- Top Header Bar: Pair identity, Live status, Controls -->
  <div class="card-header">
    <div class="pair-info">
      <div class="pair-title-row">
        <span class="crypto-icon">₿</span>
        <span class="pair-name">BTC / USD</span>
        <span class="exchange-tag">KRAKEN SPOT</span>
      </div>
      <div class="status-row">
        <span class="live-dot" class:connected={wsConnected} class:pulsing={wsConnected}></span>
        <span class="live-status-text">
          {wsConnected ? 'LIVE FEED' : 'REST SYNC'}
        </span>
        <span class="update-time">· {lastUpdateText}</span>
      </div>
    </div>

    <!-- Chart Controls: Timeframe & Chart Style -->
    <div class="header-controls">
      <div class="timeframe-group" role="group" aria-label="Chart Timeframe">
        <button
          type="button"
          class="tf-btn"
          class:active={activeTimeframe === '15'}
          onclick={() => setTimeframe('15')}
        >
          15m
        </button>
        <button
          type="button"
          class="tf-btn"
          class:active={activeTimeframe === '60'}
          onclick={() => setTimeframe('60')}
        >
          1h
        </button>
        <button
          type="button"
          class="tf-btn"
          class:active={activeTimeframe === '240'}
          onclick={() => setTimeframe('240')}
        >
          4h
        </button>
        <button
          type="button"
          class="tf-btn"
          class:active={activeTimeframe === '1440'}
          onclick={() => setTimeframe('1440')}
        >
          1D
        </button>
      </div>

      <div class="view-group" role="group" aria-label="Chart Type">
        <button
          type="button"
          class="view-btn"
          class:active={chartType === 'area'}
          onclick={() => (chartType = 'area')}
          title="Area Wave Chart"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 18 L8 12 L13 15 L21 6" />
          </svg>
        </button>
        <button
          type="button"
          class="view-btn"
          class:active={chartType === 'candles'}
          onclick={() => (chartType = 'candles')}
          title="Candlestick Chart"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="7" y1="3" x2="7" y2="21" />
            <rect x="5" y="7" width="4" height="10" fill="currentColor" />
            <line x1="17" y1="5" x2="17" y2="19" />
            <rect x="15" y="10" width="4" height="6" fill="none" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="refresh-btn"
        class:spinning={isSyncing}
        onclick={() => {
          fetchTicker();
          fetchOHLC(activeTimeframe);
        }}
        title="Sync Kraken data"
        aria-label="Refresh Market Data"
      >
        ↻
      </button>
    </div>
  </div>

  <!-- Primary Price Hero Block -->
  <div class="price-hero-section">
    <div class="hero-left">
      <div
        class="live-price"
        class:flash-up={priceFlash === 'up'}
        class:flash-down={priceFlash === 'down'}
      >
        {#if stats.price !== null}
          <span class="currency-symbol">$</span>{stats.price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        {:else}
          <span class="loading-shimmer">Connecting...</span>
        {/if}
      </div>

      {#if stats.change24h !== null && stats.changePct24h !== null}
        <div class="change-pill" class:positive={stats.changePct24h >= 0} class:negative={stats.changePct24h < 0}>
          <span class="arrow">{stats.changePct24h >= 0 ? '▲' : '▼'}</span>
          <span class="change-usd">
            {stats.change24h >= 0 ? '+' : ''}${Math.abs(stats.change24h).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
          <span class="change-pct">
            ({stats.changePct24h >= 0 ? '+' : ''}{stats.changePct24h.toFixed(2)}%)
          </span>
          <span class="change-period">24h</span>
        </div>
      {/if}
    </div>

    <!-- 24h High/Low Visual Range Bar -->
    {#if stats.high24h && stats.low24h}
      <div class="range-meter-container">
        <div class="range-labels">
          <span class="range-bound low">
            L: ${stats.low24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
          <span class="range-title">24h Range</span>
          <span class="range-bound high">
            H: ${stats.high24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div class="range-track">
          <div class="range-progress" style="width: {rangePosition}%;"></div>
          <div class="range-indicator" style="left: {rangePosition}%;"></div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Interactive Live Kraken Chart -->
  <div class="chart-wrapper">
    {#if chartLoading}
      <div class="chart-placeholder">
        <div class="spinner"></div>
        <span>Loading Kraken candles...</span>
      </div>
    {:else if chartMetrics.points.length > 0}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <svg
        class="crypto-chart-svg"
        viewBox="0 0 {CHART_WIDTH} {CHART_HEIGHT}"
        preserveAspectRatio="none"
        onmousemove={handleChartMouseMove}
        onmouseleave={handleChartLeave}
        ontouchstart={handleChartTouchMove}
        ontouchmove={handleChartTouchMove}
        ontouchend={handleChartLeave}
      >
        <defs>
          <!-- Neon Area Gradient -->
          <linearGradient id="areaGradientPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38" />
            <stop offset="60%" stop-color="#0284c7" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="areaGradientNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f87171" stop-opacity="0.38" />
            <stop offset="60%" stop-color="#b91c1c" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#0f172a" stop-opacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#818cf8" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>

        <!-- Subtle Grid Lines & Y-Axis Labels -->
        {#each [0.2, 0.5, 0.8] as factor}
          {@const yVal = PADDING_TOP + (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) * factor}
          {@const priceVal = chartMetrics.max - chartMetrics.range * factor}
          <line
            x1={PADDING_LEFT}
            y1={yVal}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y2={yVal}
            class="chart-grid-line"
          />
          <text
            x={CHART_WIDTH - PADDING_RIGHT + 8}
            y={yVal + 3}
            class="axis-price-label"
          >
            ${priceVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </text>
        {/each}

        <!-- Mode A: Area Line Chart -->
        {#if chartType === 'area'}
          <path
            d={areaPaths.area}
            fill={isPositive ? 'url(#areaGradientPos)' : 'url(#areaGradientNeg)'}
          />
          <path
            d={areaPaths.line}
            fill="none"
            stroke={isPositive ? '#38bdf8' : '#f87171'}
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="chart-line-glow"
          />

          <!-- Live price pulse dot on latest point -->
          {#if chartMetrics.points.length > 0}
            {@const lastPt = chartMetrics.points[chartMetrics.points.length - 1]}
            <circle cx={lastPt.x} cy={lastPt.y} r="4" class="live-chart-dot" />
            <circle cx={lastPt.x} cy={lastPt.y} r="8" class="live-chart-pulse" />
          {/if}
        {:else}
          <!-- Mode B: Candlestick Chart -->
          {#each chartMetrics.points as pt}
            {@const c = pt.candle}
            {@const isBull = c.close >= c.open}
            {@const candleWidth = Math.max(Math.min((CHART_WIDTH / chartMetrics.points.length) * 0.65, 10), 3)}
            {@const bodyTop = Math.min(pt.y, pt.yOpen)}
            {@const bodyHeight = Math.max(Math.abs(pt.y - pt.yOpen), 1.5)}

            <!-- Wick Line -->
            <line
              x1={pt.x}
              y1={pt.yHigh}
              x2={pt.x}
              y2={pt.yLow}
              stroke={isBull ? '#4ade80' : '#f87171'}
              stroke-width="1.2"
            />
            <!-- Candle Body -->
            <rect
              x={pt.x - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={isBull ? '#4ade80' : '#f87171'}
              rx="1"
            />
          {/each}
        {/if}

        <!-- Interactive Crosshair & Tooltip Indicator -->
        {#if hoverX !== null && hoverY !== null}
          <line
            x1={hoverX}
            y1={PADDING_TOP}
            x2={hoverX}
            y2={CHART_HEIGHT - PADDING_BOTTOM}
            class="crosshair-line"
          />
          <circle cx={hoverX} cy={hoverY} r="4.5" class="crosshair-dot" />
        {/if}
      </svg>

      <!-- Floating Glassmorphic Tooltip -->
      {#if hoveredCandle && hoverX !== null}
        <div
          class="chart-tooltip"
          style="left: {Math.min(Math.max((hoverX / CHART_WIDTH) * 100, 15), 85)}%;"
        >
          <div class="tooltip-time">{formatTime(hoveredCandle.time)}</div>
          <div class="tooltip-row">
            <span class="tt-label">Price:</span>
            <span class="tt-value bold">${hoveredCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="tooltip-row-grid">
            <span>O: ${hoveredCandle.open.toFixed(1)}</span>
            <span>H: ${hoveredCandle.high.toFixed(1)}</span>
            <span>L: ${hoveredCandle.low.toFixed(1)}</span>
            <span>V: {hoveredCandle.volume.toFixed(2)} BTC</span>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Bottom Market Snapshot Micro-Grid -->
  <div class="snapshot-grid">
    <div class="stat-card">
      <span class="stat-title">24h High</span>
      <span class="stat-num highlight-high">
        {stats.high24h ? `$${stats.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
      </span>
    </div>

    <div class="stat-card">
      <span class="stat-title">24h Low</span>
      <span class="stat-num highlight-low">
        {stats.low24h ? `$${stats.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
      </span>
    </div>

    <div class="stat-card">
      <span class="stat-title">24h Volume</span>
      <span class="stat-num">
        {stats.volume24h ? `${stats.volume24h.toLocaleString('en-US', { maximumFractionDigits: 1 })} BTC` : '—'}
      </span>
      {#if stats.price && stats.volume24h}
        <span class="stat-sub">
          ≈ ${( (stats.volume24h * stats.price) / 1_000_000 ).toFixed(1)}M USD
        </span>
      {/if}
    </div>

    <div class="stat-card">
      <span class="stat-title">Order Spread</span>
      <div class="spread-details">
        {#if stats.bid && stats.ask}
          <span class="stat-num">
            ${stats.spread !== null ? stats.spread.toFixed(1) : '0.1'}
          </span>
          <span class="stat-sub bid-ask-text">
            B: {stats.bid.toFixed(0)} | A: {stats.ask.toFixed(0)}
          </span>
        {:else}
          <span class="stat-num">—</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .market-card {
    position: relative;
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(56, 189, 248, 0.22);
    box-shadow: 0 12px 36px -6px rgba(0, 0, 0, 0.55), 0 0 24px rgba(56, 189, 248, 0.08);
    border-radius: 20px;
    padding: 1.25rem 1.4rem;
    overflow: hidden;
    text-align: left;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .market-card:hover {
    border-color: rgba(56, 189, 248, 0.35);
    box-shadow: 0 16px 42px -6px rgba(0, 0, 0, 0.65), 0 0 32px rgba(56, 189, 248, 0.12);
  }

  /* Header */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-bottom: 0.85rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  .pair-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .pair-title-row {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .crypto-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: linear-gradient(135deg, #f7931a 0%, #ffb74d 100%);
    color: #0b0e14;
    font-size: 0.8rem;
    font-weight: 800;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
  }

  .pair-name {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: 0.02em;
  }

  .exchange-tag {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    background: rgba(56, 189, 248, 0.12);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.28);
    border-radius: 6px;
    letter-spacing: 0.05em;
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    color: #94a3b8;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #64748b;
    display: inline-block;
  }

  .live-dot.connected {
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
  }

  .live-dot.pulsing {
    animation: pulseGlow 2s infinite;
  }

  @keyframes pulseGlow {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }

  .live-status-text {
    font-weight: 600;
    font-size: 0.7rem;
    letter-spacing: 0.04em;
    color: #cbd5e1;
  }

  .update-time {
    color: #64748b;
  }

  /* Controls */
  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timeframe-group, .view-group {
    display: flex;
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 2px;
  }

  .tf-btn, .view-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 0.25rem 0.5rem;
    font-size: 0.72rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tf-btn:hover, .view-btn:hover {
    color: #e2e8f0;
  }

  .tf-btn.active, .view-btn.active {
    background: #0284c7;
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35);
  }

  .refresh-btn {
    background: rgba(17, 24, 39, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #94a3b8;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease, transform 0.25s ease;
  }

  .refresh-btn:hover {
    color: #38bdf8;
    transform: rotate(35deg);
  }

  .refresh-btn.spinning {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Price Hero Section */
  .price-hero-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem 0 0.85rem;
  }

  .hero-left {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.85rem;
  }

  .live-price {
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 800;
    color: #38bdf8;
    font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
    letter-spacing: -0.02em;
    line-height: 1;
    transition: color 0.3s ease, text-shadow 0.3s ease;
  }

  .currency-symbol {
    font-size: 0.8em;
    opacity: 0.85;
    margin-right: 2px;
  }

  .flash-up {
    color: #4ade80 !important;
    text-shadow: 0 0 16px rgba(74, 222, 128, 0.6);
  }

  .flash-down {
    color: #f87171 !important;
    text-shadow: 0 0 16px rgba(248, 113, 113, 0.6);
  }

  .loading-shimmer {
    font-size: 1.3rem;
    color: #64748b;
  }

  .change-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    font-family: monospace;
  }

  .change-pill.positive {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  .change-pill.negative {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
  }

  .change-period {
    font-size: 0.7rem;
    opacity: 0.75;
    margin-left: 2px;
  }

  /* Range Meter */
  .range-meter-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 170px;
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: #94a3b8;
    font-family: monospace;
  }

  .range-title {
    font-size: 0.65rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .range-bound.low { color: #f87171; }
  .range-bound.high { color: #4ade80; }

  .range-track {
    position: relative;
    height: 5px;
    background: rgba(255, 255, 255, 0.09);
    border-radius: 999px;
    overflow: visible;
  }

  .range-progress {
    height: 100%;
    background: linear-gradient(90deg, #f87171 0%, #fbbf24 50%, #4ade80 100%);
    border-radius: 999px;
  }

  .range-indicator {
    position: absolute;
    top: 50%;
    width: 9px;
    height: 9px;
    background: #ffffff;
    border: 2px solid #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  /* Chart Area */
  .chart-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    margin: 0.5rem 0 1rem;
    background: rgba(11, 17, 33, 0.55);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.6rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2.5px solid rgba(56, 189, 248, 0.2);
    border-top-color: #38bdf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .crypto-chart-svg {
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
  }

  .chart-grid-line {
    stroke: rgba(255, 255, 255, 0.05);
    stroke-dasharray: 4 4;
    stroke-width: 1;
  }

  .axis-price-label {
    fill: #64748b;
    font-size: 9px;
    font-family: monospace;
  }

  .live-chart-dot {
    fill: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
  }

  .live-chart-pulse {
    fill: #38bdf8;
    opacity: 0.3;
    animation: pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  @keyframes pulseRing {
    0% { r: 4px; opacity: 0.8; }
    100% { r: 12px; opacity: 0; }
  }

  .crosshair-line {
    stroke: rgba(148, 163, 184, 0.45);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }

  .crosshair-dot {
    fill: #ffffff;
    stroke: #38bdf8;
    stroke-width: 2.5;
  }

  /* Tooltip */
  .chart-tooltip {
    position: absolute;
    top: 10px;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.92);
    border: 1px solid rgba(56, 189, 248, 0.35);
    backdrop-filter: blur(8px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    padding: 0.4rem 0.65rem;
    pointer-events: none;
    z-index: 10;
    font-size: 0.72rem;
    min-width: 140px;
  }

  .tooltip-time {
    color: #94a3b8;
    font-size: 0.66rem;
    margin-bottom: 2px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 2px;
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
  }

  .tt-label { color: #64748b; }
  .tt-value { color: #f8fafc; font-family: monospace; }
  .tt-value.bold { font-weight: 700; color: #38bdf8; }

  .tooltip-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 8px;
    margin-top: 3px;
    color: #94a3b8;
    font-family: monospace;
    font-size: 0.65rem;
  }

  /* Snapshot Grid */
  .snapshot-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.65rem;
    margin-top: 0.5rem;
  }

  .stat-card {
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 0.55rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .stat-card:hover {
    background: rgba(17, 24, 39, 0.85);
    border-color: rgba(56, 189, 248, 0.2);
  }

  .stat-title {
    font-size: 0.68rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }

  .stat-num {
    font-size: 0.92rem;
    font-weight: 700;
    color: #f1f5f9;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: -0.01em;
  }

  .highlight-high { color: #4ade80; }
  .highlight-low { color: #f87171; }

  .stat-sub {
    font-size: 0.65rem;
    color: #64748b;
    font-family: monospace;
  }

  .bid-ask-text {
    font-size: 0.62rem;
    color: #94a3b8;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .market-card {
      padding: 1rem;
      border-radius: 16px;
    }

    .snapshot-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-controls {
      width: 100%;
      justify-content: space-between;
    }

    .range-meter-container {
      width: 100%;
    }

    .chart-wrapper {
      height: 175px;
    }
  }
</style>
