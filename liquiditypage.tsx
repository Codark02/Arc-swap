import { useState } from "react";
import { TOKENS, Token } from "../constants/tokens";
import { useWallet } from "../context/WalletContext";
import { useLiquidity } from "../hooks/useLiquidity";
import { useTokenBalance } from "../hooks/useTokenBalance";
import TokenSelector, { TokenLogo } from "../components/TokenSelector";

type LiquidityTab = "add" | "remove";

export default function LiquidityPage() {
  const [tab, setTab] = useState<LiquidityTab>("add");
  const { isConnected, isCorrectChain, connect, switchChain } = useWallet();
  const { addLiquidity, removeLiquidity, isLoading, error } = useLiquidity();

  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [slippage] = useState(0.5);
  const [success, setSuccess] = useState(false);

  const { balance: balA, refetch: refetchA } = useTokenBalance(tokenA);
  const { balance: balB, refetch: refetchB } = useTokenBalance(tokenB);

  const handleAmountAChange = (v: string) => {
    setAmountA(v);
    if (v && !isNaN(parseFloat(v))) {
      setAmountB((parseFloat(v) * 0.921).toFixed(6));
    } else {
      setAmountB("");
    }
  };

  const handleAmountBChange = (v: string) => {
    setAmountB(v);
    if (v && !isNaN(parseFloat(v))) {
      setAmountA((parseFloat(v) * 1.086).toFixed(6));
    } else {
      setAmountA("");
    }
  };

  const handleAdd = async () => {
    const ok = await addLiquidity(tokenA, tokenB, amountA, amountB, slippage);
    if (ok) {
      setSuccess(true);
      setAmountA("");
      setAmountB("");
      await refetchA();
      await refetchB();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const handleRemove = async () => {
    const ok = await removeLiquidity(tokenA, tokenB, lpAmount, slippage);
    if (ok) {
      setSuccess(true);
      setLpAmount("");
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const canAdd =
    isConnected &&
    isCorrectChain &&
    !!amountA &&
    parseFloat(amountA) > 0 &&
    !!amountB &&
    parseFloat(amountB) > 0 &&
    !isLoading;

  const canRemove =
    isConnected &&
    isCorrectChain &&
    !!lpAmount &&
    parseFloat(lpAmount) > 0 &&
    !isLoading;

  return (
    <div
      className="fade-up"
      style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Liquidity
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
          Add or remove liquidity from pools to earn fees.
        </p>
      </div>

      {/* Pool selector */}
      <div
        className="glass"
        style={{
          borderRadius: 20,
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Pool:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TokenSelector value={tokenA} onChange={setTokenA} exclude={tokenB} label="Token A" />
          <span style={{ color: "var(--text-dim)", fontSize: 18 }}>/</span>
          <TokenSelector value={tokenB} onChange={setTokenB} exclude={tokenA} label="Token B" />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,245,212,0.08)",
              border: "1px solid var(--border-cyan)",
              borderRadius: 10,
              padding: "4px 12px",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>0.3% fee</span>
          </div>
        </div>
      </div>

      {/* Add / Remove tabs */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 4,
        }}
        role="tablist"
        aria-label="Liquidity actions"
      >
        <button
          className={`tab-btn${tab === "add" ? " active" : ""}`}
          onClick={() => setTab("add")}
          style={{ flex: 1 }}
          type="button"
          role="tab"
          aria-selected={tab === "add"}
          id="tab-add"
          aria-controls="panel-add"
        >
          Add Liquidity
        </button>
        <button
          className={`tab-btn${tab === "remove" ? " active" : ""}`}
          onClick={() => setTab("remove")}
          style={{ flex: 1 }}
          type="button"
          role="tab"
          aria-selected={tab === "remove"}
          id="tab-remove"
          aria-controls="panel-remove"
        >
          Remove Liquidity
        </button>
      </div>

      {/* Add form */}
      {tab === "add" && (
        <div
          className="glass-cyan fade-up"
          style={{ borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}
          role="tabpanel"
          id="panel-add"
          aria-labelledby="tab-add"
        >
          <LiqInput
            label={tokenA.symbol}
            token={tokenA}
            value={amountA}
            onChange={handleAmountAChange}
            balance={balA}
            onMax={() => handleAmountAChange(balA)}
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <span aria-hidden="true" style={{ color: "var(--text-dim)", fontSize: 20, lineHeight: 1 }}>
              +
            </span>
          </div>
          <LiqInput
            label={tokenB.symbol}
            token={tokenB}
            value={amountB}
            onChange={handleAmountBChange}
            balance={balB}
            onMax={() => handleAmountBChange(balB)}
          />

          {amountA && amountB && parseFloat(amountA) > 0 && (
            <div
              className="fade-up"
              style={{
                marginTop: 4,
                borderTop: "1px solid var(--border)",
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <InfoRow label="Pool Share" value="< 0.01%" />
              <InfoRow
                label="Rate"
                value={`1 ${tokenA.symbol} = ${(parseFloat(amountB) / parseFloat(amountA)).toFixed(6)} ${tokenB.symbol}`}
              />
              <InfoRow label="Slippage" value={`${slippage}%`} />
            </div>
          )}
        </div>
      )}

      {/* Remove form */}
      {tab === "remove" && (
        <div
          className="glass-cyan fade-up"
          style={{ borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
          role="tabpanel"
          id="panel-remove"
          aria-labelledby="tab-remove"
        >
          <div>
            <label
              htmlFor="lp-amount"
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              LP Token Amount
            </label>
            <input
              id="lp-amount"
              className="input-field"
              type="number"
              inputMode="decimal"
              placeholder="0.00…"
              value={lpAmount}
              onChange={(e) => setLpAmount(e.target.value)}
              min="0"
              step="any"
              autoComplete="off"
              spellCheck={false}
              style={{ padding: "14px 18px", fontSize: 20, fontWeight: 700 }}
            />
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setLpAmount(String(p))}
                aria-label={`Remove ${p}% of liquidity`}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "border-color 150ms ease, color 150ms ease, background 150ms ease",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-cyan)";
                  e.currentTarget.style.color = "var(--cyan)";
                  e.currentTarget.style.background = "var(--cyan-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {p}%
              </button>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)" }}>
              You will receive:
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { token: tokenA, amount: lpAmount ? (parseFloat(lpAmount) * 0.5).toFixed(4) : "0" },
                { token: tokenB, amount: lpAmount ? (parseFloat(lpAmount) * 0.5 * 0.921).toFixed(4) : "0" },
              ].map(({ token, amount }) => (
                <div
                  key={token.address}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TokenLogo token={token} size={20} />
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text)",
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {amount}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{token.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            background: "var(--red-glow)",
            border: "1px solid rgba(255,77,109,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 13,
            color: "var(--red)",
          }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: "rgba(6,214,160,0.1)",
            border: "1px solid rgba(6,214,160,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 13,
            color: "var(--green)",
            fontWeight: 600,
          }}
        >
          ✓ Transaction submitted successfully!
        </div>
      )}

      {/* CTA */}
      {!isConnected ? (
        <button
          className="btn-primary"
          onClick={connect}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
          type="button"
        >
          Connect Wallet
        </button>
      ) : !isCorrectChain ? (
        <button
          className="btn-primary"
          onClick={switchChain}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
          type="button"
        >
          Switch to Arc Testnet
        </button>
      ) : tab === "add" ? (
        <button
          className="btn-primary"
          onClick={handleAdd}
          disabled={!canAdd}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
          aria-busy={isLoading}
          type="button"
        >
          {isLoading ? "Adding Liquidity…" : !amountA ? "Enter amounts" : "Add Liquidity"}
        </button>
      ) : (
        <button
          className="btn-primary"
          onClick={handleRemove}
          disabled={!canRemove}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
          aria-busy={isLoading}
          type="button"
        >
          {isLoading ? "Removing…" : !lpAmount ? "Enter LP amount" : "Remove Liquidity"}
        </button>
      )}
    </div>
  );
}

function LiqInput({
  label,
  token,
  value,
  onChange,
  balance,
  onMax,
}: {
  label: string;
  token: Token;
  value: string;
  onChange: (v: string) => void;
  balance: string;
  onMax?: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.035)",
        borderRadius: 16,
        padding: "14px 18px",
        border: "1px solid var(--border)",
        transition: "border-color 200ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TokenLogo token={token} size={20} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {parseFloat(balance || "0").toFixed(4)}
          </span>
          {onMax && (
            <button
              type="button"
              onClick={onMax}
              aria-label={`Use max ${label} balance`}
              style={{
                background: "var(--cyan-glow)",
                border: "1px solid var(--border-cyan)",
                borderRadius: 6,
                color: "var(--cyan)",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                transition: "background 150ms ease",
              }}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <input
        className="input-field"
        type="number"
        inputMode="decimal"
        placeholder="0.00…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="any"
        autoComplete="off"
        spellCheck={false}
        aria-label={`Amount of ${label}`}
        style={{
          fontSize: 22,
          fontWeight: 700,
          padding: 0,
          border: "none",
          background: "transparent",
          borderRadius: 0,
          fontFamily: "'Space Mono', monospace",
          boxShadow: "none",
        }}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          color: "var(--text)",
          fontFamily: "'Space Mono', monospace",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}