<script lang="ts">
  import { onMount } from 'svelte';

  type Analysis = {
    signal?: string;
    confidence?: number;
    reasoning?: string;
  };

  let btcPrice = $state<number | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let analysis = $state<Analysis | null>(null);
  let analyzing = $state(false);

  function getSignalClass(signal?: string) {
    const normalized = signal?.trim().toUpperCase();

    if (normalized === 'BUY' || normalized === 'LONG' || normalized === 'BULLISH') return 'long';
    if (normalized === 'SELL' || normalized === 'SHORT' || normalized === 'BEARISH') return 'short';
    if (normalized === 'HOLD' || normalized === 'NEUTRAL' || normalized === 'WAIT') return 'neutral';

    return 'neutral';
  }

  async function fetchBtcPrice() {
    try {
      const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
      if (!res.ok) throw new Error('Failed to fetch ticker');
      const data = await res.json();
      const ticker = data.result.XXBTZUSD || data.result.XBTUSD;
      btcPrice = parseFloat(ticker.c[0]);
      error = null;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function runAiAnalysis() {
    analyzing = true;
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();

      if (data?.success && data?.analysis) {
        analysis = data.analysis as Analysis;
      } else {
        analysis = null;
      }
    } catch (err) {
      analysis = null;
      console.error(err);
    } finally {
      analyzing = false;
    }
  }

  onMount(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 10000);
    return () => clearInterval(interval);
  });
</script>

<main class="container">
  <section class="hero" aria-labelledby="page-title">
    <h1 id="page-title">
      Trading <span class="title-highlight">Bot</span>
    </h1>

    <p class="tagline">An AI-guided trading experience</p>

    <div class="price-card">
      <span class="price-label">BTC / USD</span>
      {#if loading}
        <span class="price-value loading">Loading...</span>
      {:else if error}
        <span class="price-value error">Unavailable</span>
      {:else}
        <span class="price-value">
          ${btcPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      {/if}
    </div>

    <img class="avatar" src="/bitcoin.png" alt="bitcoin" width="210" height="210" />

    <p class="status-badge" aria-label="Available to trade">
      <span aria-hidden="true">●</span> Available to trade
    </p>

    <button class="analyze-btn" type="button" onclick={runAiAnalysis} disabled={analyzing}>
      {analyzing ? 'Analyzing with Jev...' : 'Run Jev AI Analysis'}
    </button>

    {#if analysis && analysis.signal}
      <div class="analysis-box">
        <h3>Signal: <span class={getSignalClass(analysis.signal)}>{analysis.signal}</span></h3>
        {#if typeof analysis.confidence === 'number'}
          <p><strong>Confidence:</strong> {(analysis.confidence * 100).toFixed(1)}%</p>
        {/if}
        {#if analysis.reasoning}
          <p>{analysis.reasoning}</p>
        {/if}
      </div>
    {/if}
  </section>
</main>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    color: #f8fafc;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #171523 0%, #111827 48%, #0d1b2e 100%);
  }
  .container {
    width: min(100% - 2rem, 1040px);
    margin: 0 auto;
    padding: 3rem 0;
    text-align: center;
  }
  .hero {
    display: grid;
    justify-items: center;
    gap: 1.25rem;
  }
  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
  }
  .title-highlight { color: #a9dff2; }
  .tagline { color: #d5dfef; margin: 0; }
  .price-card {
    display: flex;
    flex-direction: column;
    padding: 0.75rem 1.5rem;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(169, 223, 242, 0.2);
    border-radius: 12px;
  }
  .price-label { font-size: 0.75rem; color: #94a3b8; }
  .price-value { font-size: 1.5rem; font-weight: 700; color: #38bdf8; font-family: monospace; }
  .avatar {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    border: 3px solid #28d7e5;
  }
  .status-badge {
    padding: 0.4rem 0.75rem;
    border: 1px solid rgba(169, 223, 242, 0.2);
    border-radius: 999px;
    color: #b9c8dc;
    font-size: 0.84rem;
  }
  .status-badge span { color: #4ade80; }
  .analyze-btn {
    padding: 0.75rem 1.5rem;
    background: #0284c7;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .analyze-btn:hover { background: #0369a1; }
  .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .analysis-box {
    margin-top: 1rem;
    padding: 1rem 1.5rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 10px;
    max-width: 480px;
  }
  .long { color: #4ade80; }
  .short { color: #f87171; }
</style>