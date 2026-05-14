import { Page } from "../App";
import { useWallet } from "../context/WalletContext";

interface HeaderProps {
  page: Page;
  setPage: (p: Page) => void;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Header({ page, setPage }: HeaderProps) {
  const { address, isConnected, isConnecting, isCorrectChain, connect, disconnect, switchChain } =
    useWallet();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 64,
        background: "rgba(7,7,13,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--cyan) 0%, #0066ff 100%)",
            boxShadow: "0 0 16px var(--cyan-glow-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#07070d",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          A
        </div>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "0.04em",
            color: "var(--text)",
          }}
        >
          ArcDEX
        </span>
      </div>

      {/* Nav Tabs */}
      <nav aria-label="Main navigation" style={{ display: "flex", gap: 4 }}>
        <button
          className={`tab-btn${page === "swap" ? " active" : ""}`}
          onClick={() => setPage("swap")}
          aria-current={page === "swap" ? "page" : undefined}
          type="button"
        >
          Swap
        </button>
        <button
          className={`tab-btn${page === "liquidity" ? " active" : ""}`}
          onClick={() => setPage("liquidity")}
          aria-current={page === "liquidity" ? "page" : undefined}
          type="button"
        >
          Liquidity
        </button>
      </nav>

      {/* Wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isConnected && !isCorrectChain && (
          <button
            className="btn-ghost"
            onClick={switchChain}
            style={{ padding: "8px 14px", fontSize: 13 }}
            aria-label="Switch to Arc Testnet"
            type="button"
          >
            ⚠ Wrong Network
          </button>
        )}
        {!isConnected ? (
          <button
            className="btn-primary"
            onClick={connect}
            disabled={isConnecting}
            style={{ padding: "10px 20px", fontSize: 14 }}
            aria-busy={isConnecting}
            type="button"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </button>
        ) : (
          <button
            className="btn-ghost"
            onClick={disconnect}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontFamily: "'Space Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            aria-label={`Connected as ${address}. Click to disconnect.`}
            type="button"
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--cyan)",
                display: "inline-block",
                boxShadow: "0 0 8px var(--cyan)",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
            {shortAddr(address!)}
          </button>
        )}
      </div>
    </header>
  );
}