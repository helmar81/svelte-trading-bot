import { q as attr, e as escape_html } from "../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let analyzing = false;
    $$renderer2.push(`<main class="container svelte-1uha8ag"><section class="hero svelte-1uha8ag" aria-labelledby="page-title"><h1 id="page-title" class="svelte-1uha8ag">Trading <span class="title-highlight svelte-1uha8ag">Bot</span></h1> <img class="avatar svelte-1uha8ag" src="/bitcoin.png" alt="bitcoin" width="210" height="210"/> <p class="tagline svelte-1uha8ag">An AI-guided trading experience</p> <div class="price-card svelte-1uha8ag"><span class="price-label svelte-1uha8ag">BTC / USD</span> `);
    {
      $$renderer2.push(`<!--[0--><span class="price-value loading svelte-1uha8ag">Loading...</span>`);
    }
    $$renderer2.push(`<!--]--></div> <p class="status-badge svelte-1uha8ag" aria-label="Exchange connected"><span aria-hidden="true" class="svelte-1uha8ag">●</span> Exchange connected</p> <button class="analyze-btn svelte-1uha8ag" type="button"${attr("disabled", analyzing, true)}>${escape_html("Run market analysis")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section> <aside class="ai-disclosure svelte-1uha8ag" aria-label="AI and risk notice"><span class="disclosure-icon svelte-1uha8ag" aria-hidden="true">✦</span> <p class="svelte-1uha8ag">Educational market analysis only 
        — not financial advice. Crypto assets are volatile. 
        AI signals can be wrong; verify independently and use risk controls.</p></aside> <footer class="footer"><p class="technology-credit">Created with SvelteKit deployed on Firebase.</p> <p class="creator-credit">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} | Built by <a href="https://uspekhi.web.app" target="_blank" rel="noopener noreferrer" aria-label="Visit USPEKHI Web Development">USPEKHI</a></p></footer></main>`);
  });
}
export {
  _page as default
};
