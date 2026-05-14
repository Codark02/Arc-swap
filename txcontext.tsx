import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type TxStatus = "pending" | "success" | "error";

export interface TxRecord {
  id: string;
  hash: string;
  description: string;
  status: TxStatus;
  timestamp: number;
}

interface TxContextType {
  txs: TxRecord[];
  addTx: (hash: string, description: string) => string;
  updateTx: (id: string, status: TxStatus) => void;
  clearTx: (id: string) => void;
}

const TxContext = createContext<TxContextType | null>(null);

export function TxProvider({ children }: { children: ReactNode }) {
  const [txs, setTxs] = useState<TxRecord[]>([]);

  const addTx = useCallback((hash: string, description: string): string => {
    const id = Math.random().toString(36).slice(2);
    setTxs((prev) => [
      ...prev,
      { id, hash, description, status: "pending", timestamp: Date.now() },
    ]);
    return id;
  }, []);

  const updateTx = useCallback((id: string, status: TxStatus) => {
    setTxs((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status } : tx))
    );
  }, []);

  const clearTx = useCallback((id: string) => {
    setTxs((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  return (
    <TxContext.Provider value={{ txs, addTx, updateTx, clearTx }}>
      {children}
    </TxContext.Provider>
  );
}

export function useTx() {
  const ctx = useContext(TxContext);
  if (!ctx) throw new Error("useTx must be used inside TxProvider");
  return ctx;
}