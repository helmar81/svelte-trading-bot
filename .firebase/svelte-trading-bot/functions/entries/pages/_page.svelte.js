import { a6 as ssr_context, a7 as attr_class, e as escape_html, a8 as attr } from "../../chunks/index.js";
import "clsx";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function MarketSnapshot($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTimeframe = "15";
    let chartType = "area";
    let priceFlash = null;
    let wsConnected = false;
    let isSyncing = false;
    let lastUpdateText = "Connecting...";
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="market-card svelte-cadx5n"><div class="card-header svelte-cadx5n"><div class="pair-info svelte-cadx5n"><div class="pair-title-row svelte-cadx5n"><span class="crypto-icon svelte-cadx5n">₿</span> <span class="pair-name svelte-cadx5n">BTC / USD</span> <span class="exchange-tag svelte-cadx5n">KRAKEN SPOT</span></div> <div class="status-row svelte-cadx5n"><span${attr_class("live-dot svelte-cadx5n", void 0, { "connected": wsConnected, "pulsing": wsConnected })}></span> <span class="live-status-text svelte-cadx5n">${escape_html("REST SYNC")}</span> <span class="update-time svelte-cadx5n">· ${escape_html(lastUpdateText)}</span></div></div> <div class="header-controls svelte-cadx5n"><div class="timeframe-group svelte-cadx5n" role="group" aria-label="Chart Timeframe"><button type="button"${attr_class("tf-btn svelte-cadx5n", void 0, { "active": activeTimeframe === "15" })}>15m</button> <button type="button"${attr_class("tf-btn svelte-cadx5n", void 0, { "active": activeTimeframe === "60" })}>1h</button> <button type="button"${attr_class("tf-btn svelte-cadx5n", void 0, { "active": activeTimeframe === "240" })}>4h</button> <button type="button"${attr_class("tf-btn svelte-cadx5n", void 0, { "active": activeTimeframe === "1440" })}>1D</button></div> <div class="view-group svelte-cadx5n" role="group" aria-label="Chart Type"><button type="button"${attr_class("view-btn svelte-cadx5n", void 0, { "active": chartType === "area" })} title="Area Wave Chart"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="svelte-cadx5n"><path d="M3 18 L8 12 L13 15 L21 6" class="svelte-cadx5n"></path></svg></button> <button type="button"${attr_class("view-btn svelte-cadx5n", void 0, { "active": chartType === "candles" })} title="Candlestick Chart"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="svelte-cadx5n"><line x1="7" y1="3" x2="7" y2="21" class="svelte-cadx5n"></line><rect x="5" y="7" width="4" height="10" fill="currentColor" class="svelte-cadx5n"></rect><line x1="17" y1="5" x2="17" y2="19" class="svelte-cadx5n"></line><rect x="15" y="10" width="4" height="6" fill="none" class="svelte-cadx5n"></rect></svg></button></div> <button type="button"${attr_class("refresh-btn svelte-cadx5n", void 0, { "spinning": isSyncing })} title="Sync Kraken data" aria-label="Refresh Market Data">↻</button></div></div> <div class="price-hero-section svelte-cadx5n"><div class="hero-left svelte-cadx5n"><div${attr_class("live-price svelte-cadx5n", void 0, {
      "flash-up": priceFlash === "up",
      "flash-down": priceFlash === "down"
    })}>`);
    {
      $$renderer2.push(`<!--[-1--><span class="loading-shimmer svelte-cadx5n">Connecting...</span>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="chart-wrapper svelte-cadx5n">`);
    {
      $$renderer2.push(`<!--[0--><div class="chart-placeholder svelte-cadx5n"><div class="spinner svelte-cadx5n"></div> <span class="svelte-cadx5n">Loading Kraken candles...</span></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="snapshot-grid svelte-cadx5n"><div class="stat-card svelte-cadx5n"><span class="stat-title svelte-cadx5n">24h High</span> <span class="stat-num highlight-high svelte-cadx5n">${escape_html("—")}</span></div> <div class="stat-card svelte-cadx5n"><span class="stat-title svelte-cadx5n">24h Low</span> <span class="stat-num highlight-low svelte-cadx5n">${escape_html("—")}</span></div> <div class="stat-card svelte-cadx5n"><span class="stat-title svelte-cadx5n">24h Volume</span> <span class="stat-num svelte-cadx5n">${escape_html("—")}</span> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="stat-card svelte-cadx5n"><span class="stat-title svelte-cadx5n">Order Spread</span> <div class="spread-details svelte-cadx5n">`);
    {
      $$renderer2.push(`<!--[-1--><span class="stat-num svelte-cadx5n">—</span>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div>`);
  });
}
function AIAnalysis($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let analyzingAgents = false;
    $$renderer2.push(`<div class="agent-section"><button class="agent-btn" type="button"${attr("disabled", analyzingAgents, true)}>${escape_html("Run Agent Analysis")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let analyzing = false;
    $$renderer2.push(`<main class="container svelte-1uha8ag"><section class="hero svelte-1uha8ag" aria-labelledby="page-title"><h1 id="page-title" class="svelte-1uha8ag">Trading <span class="title-highlight svelte-1uha8ag">Bot</span></h1> <img class="avatar svelte-1uha8ag" src="/bitcoin.png" alt="bitcoin" width="210" height="210"/> <p class="tagline svelte-1uha8ag">An AI-guided trading experience</p> `);
    MarketSnapshot($$renderer2);
    $$renderer2.push(`<!----> <button class="analyze-btn svelte-1uha8ag" type="button"${attr("disabled", analyzing, true)}>${escape_html("Run market analysis")}</button> `);
    AIAnalysis($$renderer2);
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <aside class="ai-disclosure svelte-1uha8ag" aria-label="AI and risk notice"><span class="disclosure-icon svelte-1uha8ag" aria-hidden="true">✦</span> <p class="svelte-1uha8ag">Educational market analysis only 
        — not financial advice. Cryptocurrency assets are volatile. 
        AI signals can be wrong; verify independently and use risk controls.</p></aside> <footer class="footer svelte-1uha8ag"><p class="technology-credit">Created with SvelteKit deployed on Firebase.</p> <p class="creator-credit">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} | Built by <a href="https://uspekhi.web.app" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-200 hover:text-blue-300"><strong>USPEKHI</strong></a> <br/> <a href="/privacy.html" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-200 hover:text-blue-300">Privacy Policy</a></p></footer></main>`);
  });
}
export {
  _page as default
};
