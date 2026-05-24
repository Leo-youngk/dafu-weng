import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { CATEGORIES, Transaction } from "./data";
import { Theme } from "./themes";

type Props = {
  transactions: Transaction[];
  theme: Theme;
  onDelete: (id: string) => void;
};

function fmt(n: number) {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === today.toISOString().slice(0, 10)) return "今天";
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "昨天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function groupByDate(txns: Transaction[]) {
  const map: Record<string, Transaction[]> = {};
  for (const t of txns) {
    (map[t.date] = map[t.date] || []).push(t);
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
}

export function TransactionHistory({ transactions, theme: T, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    const cat = CATEGORIES.find(c => c.id === t.category);
    const matchSearch = !search || t.description.includes(search) || cat?.name.includes(search);
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  const grouped = groupByDate(filtered);

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 20, paddingBottom: 12,
      }}>
        <div>
          <p style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>账单记录</p>
          <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
            共 {transactions.length} 笔记录
          </p>
        </div>
        <motion.button whileTap={{ scale: 0.85 }}
          onClick={() => { setShowSearch(!showSearch); if (showSearch) { setSearch(""); setFilterType("all"); } }}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: showSearch ? T.primary : T.card,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
          {showSearch
            ? <X size={15} color="#fff" />
            : <Search size={15} color={T.sub} />
          }
        </motion.button>
      </div>

      {/* Search + Filter */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 10 }}
          >
            {/* Search input */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.card, borderRadius: 12, padding: "9px 14px",
              marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <Search size={14} color={T.muted} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索描述或分类..."
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: T.text, fontSize: 13, fontFamily: "inherit",
                }}
              />
              {search && (
                <motion.button whileTap={{ scale: 0.85 }}
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: T.muted }}>
                  <X size={13} />
                </motion.button>
              )}
            </div>

            {/* Type filter */}
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "expense", "income"] as const).map(t => (
                <motion.button key={t} whileTap={{ scale: 0.92 }}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 16, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: filterType === t ? 600 : 400,
                    background: filterType === t ? T.primary : T.card,
                    color: filterType === t ? "#fff" : T.sub,
                    boxShadow: filterType === t ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >{t === "all" ? "全部" : t === "expense" ? "支出" : "收入"}</motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>📭</p>
          <p style={{ color: T.muted, fontSize: 14 }}>
            {search ? "没有找到相关记录" : "暂无记录"}
          </p>
        </div>
      ) : (
        grouped.map(([date, txns]) => {
          const dayExp = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date} style={{ marginBottom: 14 }}>
              {/* Date header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 6, paddingLeft: 2, paddingRight: 2,
              }}>
                <p style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{formatDateLabel(date)}</p>
                {dayExp > 0 && (
                  <p style={{ color: T.muted, fontSize: 11 }}>支出 ¥{fmt(dayExp)}</p>
                )}
              </div>

              {/* Transactions card */}
              <div style={{
                background: T.card, borderRadius: 14, overflow: "hidden",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}>
                <AnimatePresence>
                  {txns.map((t, i) => {
                    const cat = CATEGORIES.find(c => c.id === t.category);
                    const isSwiped = swipedId === t.id;
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          position: "relative",
                          borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : "none",
                          overflow: "hidden",
                        }}
                      >
                        {/* Delete button (behind) */}
                        <div style={{
                          position: "absolute", right: 0, top: 0, bottom: 0,
                          width: 70, background: "#E85A5A",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => { onDelete(t.id); setSwipedId(null); }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "#fff", fontSize: 12, fontWeight: 500,
                            }}>删除</motion.button>
                        </div>

                        {/* Main row */}
                        <motion.div
                          animate={{ x: isSwiped ? -70 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                          onClick={() => setSwipedId(isSwiped ? null : t.id)}
                          style={{
                            display: "flex", alignItems: "center",
                            padding: "11px 14px", gap: 10,
                            background: T.card, position: "relative",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: cat?.bg || T.inputBg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, flexShrink: 0,
                          }}>
                            {cat?.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              color: T.text, fontSize: 13, fontWeight: 500,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {t.description}
                            </p>
                            <p style={{ color: T.muted, fontSize: 11, marginTop: 1 }}>{cat?.name}</p>
                          </div>
                          <p style={{
                            color: t.type === "income" ? T.primary : T.text,
                            fontSize: 14, fontWeight: 600, flexShrink: 0,
                          }}>
                            {t.type === "income" ? "+" : "-"}¥{fmt(t.amount)}
                          </p>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
