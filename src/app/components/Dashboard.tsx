import { motion } from "motion/react";
import { Eye, EyeOff, ChevronRight, Bell, Menu } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, Transaction, BudgetConfig } from "./data";
import { InkIllustration } from "./InkIllustration";
import { Theme } from "./themes";

type Props = {
  transactions: Transaction[];
  theme: Theme;
  budget: BudgetConfig;
  onAddTap: () => void;
  onViewMore: () => void;
  onViewBudget: () => void;
  showToast: (msg: string) => void;
};

const TODAY = new Date();
const THIS_MONTH = TODAY.toISOString().slice(0, 7);

function shortFmt(n: number) {
  return n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

const SUB_LABELS: Record<string, string> = {
  "1": "霸王茶姬", "2": "午餐", "3": "出行", "4": "五月工资",
  "5": "周末娱乐", "6": "下午茶", "7": "月租", "8": "月卡",
};
const TIME_LABELS: Record<string, string> = {
  "1": "今天 14:32", "2": "今天 12:45", "3": "今天 08:21", "4": "昨天 09:15",
  "5": "5月22日", "6": "5月22日", "7": "5月21日", "8": "5月20日",
};

export function Dashboard({ transactions, theme: T, budget, onAddTap, onViewMore, onViewBudget, showToast }: Props) {
  const [hideBalance, setHide] = useState(false);

  const monthTxns = transactions.filter(t => t.date.startsWith(THIS_MONTH));
  const income    = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense   = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance   = income - expense;
  const recent    = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  // Budget progress
  const budgetPct = budget.total > 0 ? (expense / budget.total) * 100 : 0;
  const budgetColor = budgetPct > 100 ? "#D9534F" : budgetPct > 80 ? "#E8934A" : T.primary;

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 24 }}>

      {/* ── Top bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingBottom: 8 }}>
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={() => showToast("菜单功能开发中")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.text }}>
          <Menu size={22} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={() => showToast("暂无新通知")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.text, position: "relative" }}>
          <Bell size={20} />
          <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: "50%", background: "#E8734A" }} />
        </motion.button>
      </div>

      {/* ── Header with illustration ── */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.9 }}>
          <InkIllustration width={150} height={110} />
        </div>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1, display: "flex", alignItems: "center", gap: 6 }}>
          早安 <span style={{ fontSize: 20 }}>🌿</span>
        </h1>
        <p style={{ color: T.sub, fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
          管理收支，看见生活
        </p>
      </div>

      {/* ── Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: T.card, borderRadius: 18, padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 14, marginTop: 8 }}
      >
        {/* Centered balance */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: T.sub, fontSize: 13 }}>本月结余</span>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setHide(h => !h)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: T.muted }}>
              {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </motion.button>
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          <span style={{ color: T.sub, fontSize: 20, fontWeight: 300 }}>¥ </span>
          <span style={{ color: T.text, fontSize: 40, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 }}>
            {hideBalance ? "****" : shortFmt(balance)}
          </span>
        </motion.div>

        {/* Income / Expense */}
        <div style={{ display: "flex", gap: 0, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
          {[
            { label: "本月收入", value: income, color: T.text },
            { label: "本月支出", value: expense, color: "#E8734A" },
          ].map((item, i) => (
            <div key={item.label} style={{ flex: 1, paddingLeft: i === 1 ? 16 : 0, borderLeft: i === 1 ? `1px solid ${T.border}` : "none" }}>
              <p style={{ color: T.sub, fontSize: 12, marginBottom: 4 }}>{item.label}</p>
              <p style={{ color: item.color, fontSize: 16, fontWeight: 600 }}>
                {hideBalance ? "¥ ****" : `¥${shortFmt(item.value)}`}
              </p>
            </div>
          ))}
        </div>

        {/* Budget progress bar */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={onViewBudget}
          style={{ marginTop: 14, cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: T.sub, fontSize: 11 }}>本月预算</span>
            <span style={{ color: budgetColor, fontSize: 11, fontWeight: 500 }}>
              {hideBalance ? "****" : `¥${shortFmt(expense)}/¥${shortFmt(budget.total)}`}
              {!hideBalance && ` 已用 ${Math.min(budgetPct, 999).toFixed(0)}%`}
            </span>
          </div>
          <div style={{ height: 6, background: T.inputBg, borderRadius: 3, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetPct, 100)}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              style={{ height: "100%", borderRadius: 3, background: budgetColor }}
            />
          </div>
        </motion.div>

        {/* Add button */}
        <motion.button
          whileTap={{ scale: 0.97 }} onClick={onAddTap}
          style={{
            width: "100%", marginTop: 14, background: T.primary,
            border: "none", borderRadius: 12, padding: "13px",
            color: "#fff", fontSize: 15, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> 记录一笔
        </motion.button>
      </motion.div>

      {/* ── Recent Records ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>最近记录</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onViewMore}
          style={{ background: "none", border: "none", cursor: "pointer", color: T.sub, fontSize: 12, display: "flex", alignItems: "center", gap: 2 }}>
          查看更多 <ChevronRight size={13} />
        </motion.button>
      </div>

      <div style={{ background: T.card, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        {recent.map((t, i) => {
          const cat = CATEGORIES.find(c => c.id === t.category);
          const subLabel = SUB_LABELS[t.id] || t.description;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              style={{
                display: "flex", alignItems: "center",
                padding: "12px 16px",
                borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : "none",
                gap: 12,
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: cat?.bg || T.inputBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {cat?.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{t.description}</span>
                <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                  {subLabel !== t.description ? subLabel + " · " : ""}{TIME_LABELS[t.id] || `${new Date(t.date).getMonth()+1}月${new Date(t.date).getDate()}日`}
                </p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: t.type === "income" ? T.primary : T.text, flexShrink: 0 }}>
                {t.type === "income" ? "+" : "-"} ¥{t.amount % 1 === 0 ? t.amount : t.amount.toFixed(2)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
