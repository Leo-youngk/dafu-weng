import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { AddTransaction } from "./AddTransaction";
import { TransactionHistory } from "./TransactionHistory";
import { Transaction, BudgetConfig } from "./data";
import { Theme } from "./themes";

type Props = {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, "id">) => void;
  onDelete: (id: string) => void;
  theme: Theme;
  budget: BudgetConfig;
  initialView: "history" | "add";
};

export function RecordTab({ transactions, onAdd, onDelete, theme: T, budget, initialView }: Props) {
  const [view, setView] = useState<"history" | "add">(initialView);

  // Sync when parent changes initialView (e.g. Dashboard buttons)
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  if (view === "add") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AddTransaction
          onAdd={onAdd}
          theme={T}
          budget={budget}
          transactions={transactions}
          onBack={() => setView("history")}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Scrollable history */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>
        <TransactionHistory
          transactions={transactions}
          theme={T}
          onDelete={onDelete}
        />
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setView("add")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: T.primary,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 14px ${T.primary}55`,
          zIndex: 10,
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
