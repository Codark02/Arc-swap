import { useState, useEffect } from "react";
import { TOKENS, Token } from "../constants/tokens";
import { useWallet } from "../context/WalletContext";
import { useSwap } from "../hooks/useSwap";
import { useTokenBalance } from "../hooks/useTokenBalance";
import TokenSelector from "../components/TokenSelector";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

const RATES: Record<string, number> = {
  "USDC-EURC": 0.921,
  "EURC-USDC": 1.086,
  "USDC-USYC": 0.9987,
  "USYC-USDC": 1.0013,
  "EURC-USYC": 0.9198,
  "USYC-EURC": 1.087,
};

export default function SwapPage() {
  const { isConnected, isCorrectChain, connect, switchChain } = useWallet();
  const { swap, isSwapping, error: swapError } = useSwap();

  const [tokenIn, setTokenIn] = useState<Token>(TOKENS[0]);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState("");
  const [success, setSuccess] = useState(false);

  const { balance: balanceIn, refetch: refetchIn } = useTokenBalance(tokenIn);
  const { balance: balanceOut, refetch: refetchOut } = useTokenBalance(tokenOut);

  const getRate = (inSym: string, outSym: string) =>
    RATES[`${inSym}-${outSym}`] ?? 1;

  useEffect(() => {
    if (!amountIn || isNaN(parseFloat(amountIn))) {
      setAmountOut("");
      return;
    }
    const rate = getRate(tokenIn.symbol, tokenOut.symbol);
    setAmountOut((parseFloat(amountIn) * rate).toFixed(6));
  }, [amountIn, tokenIn, tokenOut]);

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return;
    const ok = await swap(tokenIn, tokenOut, amountIn, effectiveSlippage, amountOut);
    if (ok) {
      setSuccess(true);
      setAmountIn("");
      setAmountOut("");
      await refetchIn();
      await refetchOut();
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const effectiveSlippage = customSlippage ? parseFloat(customSlippage) : slippage;
  const rate = getRate(tokenIn.symbol, tokenOut.symbol);

  const canSwap =
    isConnected &&
    isCorrectChain &&
    !!amountIn &&
    parseFloat(amountIn) > 0 &&
    !!amountOut &&
    !isSwapping;

  return (
    <div
      className="fade-up"
      style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Swap
        </h1>
        <SlippageControl
          value={slippage}
          custom={customSlippage}
          onChange={setSlippage}
          onCustomChange={setCustomSlippage}
        />
      </div>

      {/* Main swap card */}
      <div
        className="glass-cyan"
        style={{ borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <TokenInput
          label="You pay"
          token={tokenIn}
          onTokenChange={(t) => {
            setTokenIn(t);
            setAmountIn("");
            setAmountOut("");
          }}
          amount={amountIn}
          onAmountChange={setAmountIn}
          balance={balanceIn}
          onMax={() => setAmountIn(balanceIn)}
          excludeToken={tokenOut}
        />

        {/* Flip */}
        <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
          <button
            className="btn-ghost"
            onClick={handleFlip}
            aria-label="Flip token order"
            type="button"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontSize: 18,
              transition: "transform 250ms ease, border-color 200ms ease, color 200ms ease, background 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(180deg)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
          >
            ↕
          </button>
        </div>

        <TokenInput
          label="You receive"
          token={tokenOut}
          onTokenChange={(t) => {
            setTokenOut(t);
            setAmountOut("");
          }}
          amount={amountOut}
          onAmountChange={() => {}}
          balance={balanceOut}
          excludeToken={tokenIn}
          readOnly
        />
      </div>

      {/* Price info */}
      {amountIn && amountOut && parseFloat(amountIn) > 0 && (
        <div
          className="glass fade-up"
          style={{ borderRadius: 16, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}
        >
          <InfoRow label="Rate" value={`1 ${tokenIn.symbol} = ${rate.toFixed(6)} ${tokenOut.symbol}`} />
          <InfoRow label="Price Impact" value="< 0.01%" />
          <InfoRow
            label="Min. Received"
            value={`${((parseFloat(amountOut) * (100 - effectiveSlippage)) / 100).toFixed(6)} ${tokenOut.symbol}`}
          />
          <InfoRow label="Slippage Tolerance" value={`${effectiveSlippage}%`} />
        </div>
      )}

      {/* Error */}
      {swapError && (
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
          {swapError}
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
          ✓ Swap submitted successfully!
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
      ) : (
        <button
          className="btn-primary"
          onClick={handleSwap}
          disabled={!canSwap}
          style={{ width: "100%", padding: "16px", fontSize: 16 }}
          aria-busy={isSwapping}
          type="button"
        >
          {isSwapping ? "Swapping…" : !amountIn ? "Enter an amount" : "Swap"}
        </button>
      )}
    </div>
  );
}

function TokenInput({
  label,
  token,
  onTokenChange,
  amount,
  onAmountChange,
  balance,
  onMax,
  excludeToken,
  readOnly,
}: {
  label: string;
  token: Token;
  onTokenChange: (t: Token) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  balance: string;
  onMax?: () => void;
  excludeToken?: Token;
  readOnly?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.035)",
        borderRadius: 16,
        padding: "16px 18px",
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
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Balance: {parseFloat(balance || "0").toFixed(4)}
          </span>
          {onMax && (
            <button
              type="button"
              onClick={onMax}
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
              aria-label={`Use maximum ${token.symbol} balance`}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          className="input-field"
          type="number"
          inputMode="decimal"
          placeholder="0.00…"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          readOnly={readOnly}
          min="0"
          step="any"
          autoComplete="off"
          spellCheck={false}
          aria-label={label}
          style={{
            fontSize: 24,
            fontWeight: 700,
            padding: 0,
            border: "none",
            background: "transparent",
            borderRadius: 0,
            flex: 1,
            minWidth: 0,
            fontFamily: "'Space Mono', monospace",
            cursor: readOnly ? "default" : "text",
            boxShadow: "none",
          }}
        />
        <TokenSelector
          value={token}
          onChange={onTokenChange}
          exclude={excludeToken}
          label={label}
        />
      </div>
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

function SlippageControl({
  value,
  custom,
  onChange,
  onCustomChange,
}: {
  value: number;
  custom: string;
  onChange: (v: number) => void;
  onCustomChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Slippage:</span>
      {SLIPPAGE_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => {
            onChange(opt);
            onCustomChange("");
          }}
          aria-pressed={value === opt && !custom}
          aria-label={`Set slippage to ${opt}%`}
          style={{
            background: value === opt && !custom ? "var(--cyan-glow)" : "transparent",
            border: `1px solid ${value === opt && !custom ? "var(--border-cyan)" : "var(--border)"}`,
            borderRadius: 8,
            color: value === opt && !custom ? "var(--cyan)" : "var(--text-muted)",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 8px",
            cursor: "pointer",
            transition: "all 150ms ease",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {opt}%
        </button>
      ))}
      <input
        type="number"
        placeholder="Custom…"
        value={custom}
        onChange={(e) => onCustomChange(e.target.value)}
        min="0.01"
        max="50"
        step="0.1"
        autoComplete="off"
        aria-label="Custom slippage percentage"
        style={{
          background: custom ? "var(--cyan-glow)" : "transparent",
          border: `1px solid ${custom ? "var(--border-cyan)" : "var(--border)"}`,
          borderRadius: 8,
          color: custom ? "var(--cyan)" : "var(--text-muted)",
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 8px",
          width: 68,
          outline: "none",
          fontFamily: "'Space Grotesk', sans-serif",
          transition: "all 150ms ease",
        }}
      />
    </div>
  );
}