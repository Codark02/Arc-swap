import { useEffect } from "react";
import { useTx, TxRecord } from "../context/TxContext";
import { ARC_TESTNET } from "../constants/chain";

export default function ToastContainer() {
  const { txs, clearTx } = useTx();

  return (
    <div
      aria-live="polite"
      aria-label="Transaction notifications"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 9999,
        maxWidth: 360,
        width: "calc(100vw - 48px)",
      }}
    >
      {txs.map((tx) => (
        <Toast key={tx.id} tx={tx} onClose={() => clearTx(tx.id)} />
      ))}
    </div>
  );
}

function Toast({ tx, onClose }: { tx: TxRecord; onClose: () => void }) {
  useEffect(() => {
    if (tx.status !== "pending") {
      const t = setTimeout(onClose, 6000);
      return () => clearTimeout(t);
    }
  }, [tx.status, onClose]);

  const isPending = tx.status === "pending";
  const isSuccess = tx.status === "success";
  const isError = tx.status === "error";

  const borderColor = isPending
    ? "var(--border-cyan)"
    : isSuccess
    ? "rgba(6,214,160,0.4)"
    : "rgba(255,77,109,0.4)";

  const accentColor = isPending
    ? "var(--cyan)"
    : isSuccess
    ? "var(--green)"
    : "var(--red)";

  return (
    <div
      role="status"
      aria-atomic="true"
      style={{
        background: "rgba(10,10,18,0.95)",
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        backdropFilter: "blur(20px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${accentColor}22`,
        animation: "fadeUp 0.3s ease both",
      }}
    >
      {/* Status icon */}
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `${accentColor}22`,
          border: `1px solid ${accentColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
        }}
      >
        {isPending && (
          <span
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${accentColor}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
              display: "block",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        {isSuccess && <span style={{ color: accentColor }}>✓</span>}
        {isError && <span style={{ color: accentColor }}>✕</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tx.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: accentColor,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {isPending ? "Pending…" : isSuccess ? "Confirmed" : "Failed"}
          </span>
          {tx.hash && (
            <a
              href={`${ARC_TESTNET.explorerUrl}/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textDecoration: "underline",
                fontFamily: "'Space Mono', monospace",
              }}
              aria-label={`View transaction on explorer (opens in new tab)`}
            >
              {tx.hash.slice(0, 8)}…
            </a>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        type="button"
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: 4,
          fontSize: 18,
          lineHeight: 1,
          flexShrink: 0,
          borderRadius: 6,
          transition: "color 200ms ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        ×
      </button>
    </div>
  );
}