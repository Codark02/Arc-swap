import { useState, useRef, useEffect } from "react";
import { TOKENS, Token } from "../constants/tokens";

interface TokenSelectorProps {
  value: Token;
  onChange: (t: Token) => void;
  exclude?: Token;
  label: string;
}

export function TokenLogo({ token, size = 24 }: { token: Token; size?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${token.logoColor}22`,
        border: `1.5px solid ${token.logoColor}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 700,
        color: token.logoColor,
        fontFamily: "'Space Mono', monospace",
        flexShrink: 0,
      }}
    >
      {token.symbol[0]}
    </div>
  );
}

export default function TokenSelector({ value, onChange, exclude, label }: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const available = TOKENS.filter((t) => t.address !== exclude?.address);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        className="token-chip"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select token for ${label}: currently ${value.symbol}`}
        type="button"
      >
        <TokenLogo token={value} size={22} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
          {value.symbol}
        </span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            marginLeft: 2,
          }}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={`Select token for ${label}`}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "rgba(12,12,22,0.98)",
            border: "1px solid var(--border-cyan)",
            borderRadius: 16,
            padding: 8,
            zIndex: 200,
            backdropFilter: "blur(20px)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 30px var(--cyan-glow)",
            animation: "fadeUp 0.15s ease both",
          }}
        >
          {available.map((token) => (
            <button
              key={token.address}
              role="option"
              aria-selected={token.address === value.address}
              type="button"
              onClick={() => {
                onChange(token);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 14px",
                background:
                  token.address === value.address
                    ? "var(--cyan-glow)"
                    : "transparent",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                transition: "background 150ms ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (token.address !== value.address)
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (token.address !== value.address)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <TokenLogo token={token} size={28} />
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color:
                      token.address === value.address
                        ? "var(--cyan)"
                        : "var(--text)",
                  }}
                >
                  {token.symbol}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {token.name}
                </div>
              </div>
              {token.address === value.address && (
                <span
                  aria-hidden="true"
                  style={{
                    marginLeft: "auto",
                    color: "var(--cyan)",
                    fontSize: 14,
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}