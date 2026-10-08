
  <main class="container">
    <section class="hero" aria-labelledby="page-title">
      <h1 id="page-title">
     Trading <span class="title-highlight">Bot</span>
      </h1>

      <p class="tagline">
        An AI-guided trading experience 
      </p>

      <img
        class="avatar"
        src="/bitcoin.png"
        alt="bitcoin"
        width="210"
        height="210"
      />

      <p class="status-badge" aria-label="Lorelyn is available to chat">
        <span aria-hidden="true">●</span>
        Available to trade
      </p>
    </section>
	  </main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
    color: #f8fafc;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      sans-serif;
    background:
      radial-gradient(
        circle at 12% 8%,
        rgba(76, 201, 240, 0.12),
        transparent 32rem
      ),
      radial-gradient(
        circle at 90% 88%,
        rgba(59, 130, 246, 0.14),
        transparent 35rem
      ),
      linear-gradient(135deg, #171523 0%, #111827 48%, #0d1b2e 100%);
  }

  

  .container {
    width: min(100% - 2rem, 1040px);
    flex: 1;
    margin: 0 auto;
    padding: clamp(2.5rem, 6vw, 5.5rem) 0 2rem;
    text-align: center;
  }

  .hero {
    display: grid;
    justify-items: center;
    gap: 1.25rem;
  }

  h1 {
    max-width: 980px;
    margin: 0;
    color: #f8fafc;
    font-size: clamp(2.5rem, 6.4vw, 5.75rem);
    font-weight: 800;
    line-height: 1.02;
    letter-spacing: -0.055em;
    text-wrap: balance;
  }

  .title-highlight {
    color: #a9dff2;
    text-shadow: 0 0 28px rgba(110, 231, 255, 0.12);
  }

  .tagline {
    max-width: 700px;
    margin: 0.4rem auto 0;
    color: #d5dfef;
    font-size: clamp(1.05rem, 1.6vw, 1.3rem);
    font-weight: 400;
    line-height: 1.7;
    text-wrap: pretty;
  }

  .avatar {
    width: clamp(152px, 18vw, 210px);
    height: clamp(152px, 18vw, 210px);
    display: block;
    margin: 0.75rem auto 0;
    object-fit: cover;
    border: 3px solid #28d7e5;
    border-radius: 50%;
    background-color: #0b0d17;
    box-shadow:
      0 0 0 5px rgba(40, 215, 229, 0.09),
      0 0 28px rgba(40, 215, 229, 0.32);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin: -0.2rem 0 0;
    padding: 0.4rem 0.75rem;
    border: 1px solid rgba(169, 223, 242, 0.2);
    border-radius: 999px;
    color: #b9c8dc;
    font-size: 0.84rem;
    line-height: 1;
    background: rgba(169, 223, 242, 0.06);
  }

  .status-badge span {
    color: #4ade80;
    font-size: 0.7rem;
    text-shadow: 0 0 8px rgba(74, 222, 128, 0.65);
  }

 

 

 

  :global(button:focus-visible),
  :global(a:focus-visible),
  :global(input:focus-visible),
  :global(textarea:focus-visible) {
    outline: 3px solid rgba(110, 231, 255, 0.8);
    outline-offset: 3px;
  }

  @media (max-width: 560px) {
    .container {
      width: min(100% - 1.25rem, 1040px);
      padding-top: 2.25rem;
    }

    h1 {
      font-size: clamp(2.35rem, 13vw, 3.6rem);
      letter-spacing: -0.045em;
    }

    .tagline {
      font-size: 1.02rem;
      line-height: 1.65;
    }

   
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>