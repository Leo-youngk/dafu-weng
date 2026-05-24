import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dashboard } from "./components/Dashboard";
import { RecordTab } from "./components/RecordTab";
import { Analytics } from "./components/Analytics";
import { Settings } from "./components/Settings";
import { Toast } from "./components/Toast";
import { INITIAL_TRANSACTIONS, Transaction, DEFAULT_BUDGET, BudgetConfig } from "./components/data";
import { THEMES, DEFAULT_THEME, Theme } from "./components/themes";

type Tab = "home" | "stats" | "record" | "settings";

export default function App() {
  const [tab, setTab]           = useState<Tab>("home");
  const [transactions, setTxns] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [theme, setTheme]       = useState<Theme>(DEFAULT_THEME);
  const [budget, setBudget]     = useState<BudgetConfig>(DEFAULT_BUDGET);
  const [toast, setToast]       = useState<string | null>(null);
  const [recordView, setRecordView] = useState<"history" | "add">("history");

  const T = theme;

  const showToast = useCallback((msg: string) => setToast(msg), []);
  const clearToast = useCallback(() => setToast(null), []);

  const addTxn = (t: Omit<Transaction, "id">) => {
    setTxns(p => [{ ...t, id: Date.now().toString() }, ...p]);
  };

  const deleteTxn = (id: string) => {
    setTxns(p => p.filter(t => t.id !== id));
  };

  return (
    <div style={{
      height: "100dvh",
      maxWidth: 480,
      margin: "0 auto",
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      transition: "background 0.3s",
    }}>
      {/* ── Scrollable content area ── */}
      <div style={{
        flex: 1,
        overflow: tab === "record" ? "hidden" : "auto",
        paddingTop: 0,
        paddingLeft: tab === "record" ? 0 : 16,
        paddingRight: tab === "record" ? 0 : 16,
        paddingBottom: tab === "record" ? 0 : 70,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {tab === "home" && (
              <Dashboard
                transactions={transactions}
                theme={T}
                budget={budget}
                onAddTap={() => { setRecordView("add"); setTab("record"); }}
                onViewMore={() => { setRecordView("history"); setTab("record"); }}
                onViewBudget={() => setTab("stats")}
                showToast={showToast}
              />
            )}
            {tab === "stats" && (
              <Analytics
                transactions={transactions}
                theme={T}
                budget={budget}
                showToast={showToast}
              />
            )}
            {tab === "record" && (
              <RecordTab
                transactions={transactions}
                onAdd={addTxn}
                onDelete={deleteTxn}
                theme={T}
                budget={budget}
                initialView={recordView}
              />
            )}
            {tab === "settings" && (
              <Settings
                theme={T}
                onThemeChange={setTheme}
                budget={budget}
                onBudgetChange={setBudget}
                showToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Navigation ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flexShrink: 0,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: 60,
        }}
      >
        <NavBtn active={tab === "home"} label="首页" T={T} onClick={() => setTab("home")}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" fill={tab === "home" ? "currentColor" : "none"} fillOpacity={0.1} strokeLinejoin="round" /><path d="M9 21V13h6v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>} />
        <NavBtn active={tab === "stats"} label="统计" T={T} onClick={() => setTab("stats")}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
        <NavBtn active={tab === "record"} label="记录" T={T} onClick={() => setTab("record")}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>} />
        <NavBtn active={tab === "settings"} label="设置" T={T} onClick={() => setTab("settings")}
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>} />
      </motion.div>

      {/* ── Toast ── */}
      <Toast message={toast} theme={T} onClose={clearToast} />
    </div>
  );
}

function NavBtn({ active, label, icon, onClick, T }: {
  active: boolean; label: string; icon: React.ReactNode;
  onClick: () => void; T: Theme;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 3,
        padding: "8px 0",
        background: "none", border: "none", cursor: "pointer",
        color: active ? T.primary : T.muted,
      }}
    >
      <motion.div animate={{ y: active ? -1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
        {icon}
      </motion.div>
      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>
        {label}
      </span>
    </motion.button>
  );
}
