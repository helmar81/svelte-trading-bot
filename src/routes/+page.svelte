<script lang="ts">
  import MarketSnapshot from '$lib/MarketSnapshot.svelte';

  type Analysis = {
    signal?: string;
    confidence?: number;
    reasoning?: string;
  };

  let btcPrice = $state<number | null>(null);
  let analysis = $state<Analysis | null>(null);
  let analysisError = $state('');
  let analyzing = $state(false);

  function getSignalClass(signal?: string) {
    const normalized = signal?.trim().toUpperCase();

    if (normalized === 'BUY' || normalized === 'LONG' || normalized === 'BULLISH') return 'long';
    if (normalized === 'SELL' || normalized === 'SHORT' || normalized === 'BEARISH') return 'short';
    if (normalized === 'HOLD' || normalized === 'NEUTRAL' || normalized === 'WAIT') return 'neutral';

    return 'neutral';
  }

  async function runAiAnalysis() {
    analyzing = true;
    analysis = null;
    analysisError = '';
    try {
      const res = await fetch('/api/analyze', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data?.success || !data?.analysis) {
        throw new Error(data?.error || 'Market analysis failed. Please try again.');
      }

      analysis = data.analysis as Analysis;
    } catch (err) {
      analysisError = err instanceof Error ? err.message : 'Market analysis failed. Please try again.';
      console.error(err);
    } finally {
      analyzing = false;
    }
  }
</script>

<main class="container">
  <section class="hero" aria-labelledby="page-title">
    <h1 id="page-title">
      Trading <span class="title-highlight">Bot</span>
    </h1>

    <img class="avatar" src="/bitcoin.png" alt="bitcoin" width="210" height="210" />

    <p class="tagline">An AI-guided trading experience</p>

    <MarketSnapshot onPriceUpdate={(p) => { btcPrice = p; }} />

    <button class="analyze-btn" type="button" onclick={runAiAnalysis} disabled={analyzing}>
      {analyzing ? 'Analyzing with Jev...' : 'Run market analysis'}
    </button>

    {#if analysisError}
      <p class="analysis-error" role="alert">{analysisError}</p>
    {/if}

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


   <aside class="ai-disclosure" aria-label="AI and risk notice">
      <span class="disclosure-icon" aria-hidden="true">✦</span>

      <p>
        Educational market analysis only 
        — not financial advice. Cryptocurrency assets are volatile. 
        AI signals can be wrong; verify independently and use risk controls.
      </p>

    </aside>

<footer class="footer">



    <p class="technology-credit">Created with SvelteKit deployed on Firebase.</p>

    

    <p class="creator-credit">
      © {new Date().getFullYear()} | Built by
      <a 
                href="https://uspekhi.web.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="hover:underline text-blue-200 hover:text-blue-300"
              >
                <strong>USPEKHI</strong>
              </a>
              <br />
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" class="hover:underline text-blue-200 hover:text-blue-300">
                Privacy Policy
              </a>

    </p>
  </footer>


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
  .avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 3px solid #28d7e5;
    box-shadow: 0 0 20px rgba(40, 215, 229, 0.25);
  }
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
  .analysis-error {
    max-width: 480px;
    margin: 0;
    color: #fca5a5;
  }
  .long { color: #4ade80; }
  .short { color: #f87171; }

.ai-disclosure {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    width: min(100%, 680px);
    margin: 1rem auto 0;
    padding: 0.9rem 1rem;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(56, 189, 248, 0.22);
    border-radius: 20px;
    box-shadow: 0 12px 36px -6px rgba(0, 0, 0, 0.55), 0 0 24px rgba(56, 189, 248, 0.08);
    color: #b9c8dc;
    font-size: 0.84rem;
    line-height: 1.55;
    text-align: left;
    overflow: hidden;
  }

  .ai-disclosure p {
    margin: 0;
    color: #c7d6ea;
  }

  .disclosure-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.08rem;
    color: #81e6ee;
    font-size: 1rem;
    line-height: 1;
    filter: drop-shadow(0 0 8px rgba(129, 230, 238, 0.38));
  }

  @media (max-width: 640px) {
    .ai-disclosure {
      gap: 0.6rem;
      padding: 0.8rem 0.9rem;
      border-radius: 16px;
    }
  }

</style>