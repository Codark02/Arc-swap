import { useState } from "react";
import { WalletProvider } from "./context/WalletContext";
import { TxProvider } from "./context/TxContext";
import Layout from "./components/Layout";
import SwapPage from "./pages/SwapPage";
import LiquidityPage from "./pages/LiquidityPage";

export type Page = "swap" | "liquidity";

export default function App() {
  const [page, setPage] = useState<Page>("swap");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --cyan: #00f5d4;
          --cyan-dim: #00c4aa;
          --cyan-glow: rgba(0, 245, 212, 0.15);
          --cyan-glow-strong: rgba(0, 245, 212, 0.3);
          --bg: #07070d;
          --bg-card: rgba(255,255,255,0.03);
          --bg-card-hover: rgba(255,255,255,0.055);
          --border: rgba(255,255,255,0.07);
          --border-cyan: rgba(0, 245, 212, 0.25);
          --text: #f0f0f8;
          --text-muted: rgba(240,240,248,0.45);
          --text-dim: rgba(240,240,248,0.25);
          --red: #ff4d6d;
          --red-glow: rgba(255,77,109,0.2);
          --yellow: #ffd166;
          --green: #06d6a0;
        }

        html, body {
          margin: 0; padding: 0;
          background: var(--bg);
          color: var(--text);
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          color-scheme: dark;
        }

        body {
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,245,212,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(0,100,255,0.05) 0%, transparent 60%);
          background-attachment: fixed;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .font-mono { font-family: 'Space Mono', monospace; }

        .glass {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
        }

        .glass-cyan {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-cyan);
          box-shadow: 0 0 30px var(--cyan-glow), inset 0 1px 0 rgba(0,245,212,0.08);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--cyan) 0%, var(--cyan-dim) 100%);
          color: #07070d;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
          box-shadow: 0 0 20px var(--cyan-glow-strong);
          touch-action: manipulation;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 0 35px var(--cyan-glow-strong);
        }

        .btn-primary:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-primary:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 3px;
        }

        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: 'Space Grotesk', sans-serif;
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 200ms ease, color 200ms ease, background 200ms ease;
          touch-action: manipulation;
        }

        .btn-ghost:hover {
          border-color: var(--border-cyan);
          color: var(--cyan);
          background: var(--cyan-glow);
        }

        .btn-ghost:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .input-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-family: 'Space Mono', monospace;
          transition: border-color 200ms ease, box-shadow 200ms ease;
          outline: none;
          width: 100%;
        }

        .input-field:focus {
          border-color: var(--border-cyan);
          box-shadow: 0 0 0 3px var(--cyan-glow);
        }

        .input-field::placeholder { color: var(--text-dim); }

        .token-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 8px 14px;
          cursor: pointer;
          transition: background 200ms ease, border-color 200ms ease, transform 150ms ease;
          touch-action: manipulation;
          white-space: nowrap;
          font-weight: 600;
        }

        .token-chip:hover {
          background: rgba(0,245,212,0.08);
          border-color: var(--border-cyan);
          transform: translateY(-1px);
        }

        .token-chip:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 10px 28px;
          border-radius: 12px;
          transition: all 200ms ease;
          touch-action: manipulation;
        }

        .tab-btn.active {
          background: var(--cyan-glow);
          color: var(--cyan);
          box-shadow: 0 0 15px var(--cyan-glow);
        }

        .tab-btn:not(.active) {
          color: var(--text-muted);
        }

        .tab-btn:not(.active):hover {
          color: var(--text);
          background: rgba(255,255,255,0.04);
        }

        .tab-btn:focus-visible {
          outline: 2px solid var(--cyan);
          outline-offset: 2px;
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-cyan {
          0%, 100% { box-shadow: 0 0 20px var(--cyan-glow); }
          50%       { box-shadow: 0 0 40px var(--cyan-glow-strong); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.2s ease both; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="noise-overlay" aria-hidden="true" />

      <TxProvider>
        <WalletProvider>
          <Layout page={page} setPage={setPage}>
            {page === "swap" ? <SwapPage /> : <LiquidityPage />}
          </Layout>
        </WalletProvider>
      </TxProvider>
    </>
  );
}