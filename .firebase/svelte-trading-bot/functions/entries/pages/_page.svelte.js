import { q as attr, e as escape_html } from "../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let analyzing = false;
    $$renderer2.push(`<main class="container svelte-1uha8ag"><section class="hero svelte-1uha8ag" aria-labelledby="page-title"><h1 id="page-title" class="svelte-1uha8ag">Trading <span class="title-highlight svelte-1uha8ag">Bot</span></h1> <p class="tagline svelte-1uha8ag">An AI-guided trading experience</p> <div class="price-card svelte-1uha8ag"><span class="price-label svelte-1uha8ag">BTC / USD</span> `);
    {
      $$renderer2.push(`<!--[0--><span class="price-value loading svelte-1uha8ag">Loading...</span>`);
    }
    $$renderer2.push(`<!--]--></div> <img class="avatar svelte-1uha8ag" src="/bitcoin.png" alt="bitcoin" width="210" height="210"/> <p class="status-badge svelte-1uha8ag" aria-label="Available to trade"><span aria-hidden="true" class="svelte-1uha8ag">●</span> Available to trade</p> <button class="analyze-btn svelte-1uha8ag" type="button"${attr("disabled", analyzing, true)}>${escape_html("Run Jev AI Analysis")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></section></main>`);
  });
}
export {
  _page as default
};
