import Script from "next/script";

export default function Home() {
  return (
    <>
      <div className="loading" id="loading" role="status" aria-live="polite">
        <div className="loading-wheel" aria-hidden="true" />
        <h1>Spinning Dare Wheel</h1>
        <p>From the mind of Sammi G</p>
      </div>

      <main className="game-shell">
        <header>
          <div className="brand">
            <div className="logo">
              SPINNING <span>DARE WHEEL</span>
            </div>
            <div className="creator-credit">From the mind of Sammi G</div>
          </div>
          <p>Spin for your next brave idea</p>
        </header>

        <section className="game" aria-label="Dare wheel game">
          <div className="wheel-wrap">
            <div className="pointer" aria-hidden="true" />
            <canvas
              id="wheel"
              width="900"
              height="900"
              aria-label="A wheel containing 108 colorful dares"
            />
            <button id="spin" type="button" aria-label="Spin the dare wheel">
              SPIN
            </button>
          </div>

          <aside className="result-card" aria-live="polite">
            <div className="result-label">YOUR DARE</div>
            <p id="result">Tap SPIN to let the sky decide!</p>
            <div className="count">
              <strong id="count">108</strong> colorful dares waiting
            </div>
          </aside>
        </section>

        <footer>
          Use the wheel with friends, be kind, and choose a new spin anytime.
        </footer>
      </main>

      <Script src="/game.js" strategy="afterInteractive" />
    </>
  );
}
