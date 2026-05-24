import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, Transaction } from "./data";

type Props = { transactions: Transaction[]; onDelete: (id: string) => void };

const S = {
  card: {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
  } as React.CSSProperties,
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

export function Expenses({ transactions, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = transactions.filter(t => {
    const cat = CATEGORIES.find(c => c.id === t.category);
    const matchSearch = !search || t.description.includes(search) || cat?.name.includes(search);
    const matchCat = filterCat === "all" || t.category === filterCat;
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchCat && matchType;
  });

  const grouped = groupByDate(filtered);
  const totalE = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalI = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ paddingTop: 8 }}>
        <h1 style={{ color: "#1A1A2E", fontSize: 22, fontWeight: 800 }}>账单明细</h1>
        <p style={{ color: "#9EA3B0", fontSize: 13, marginTop: 2 }}>记录每一笔花费</p>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ ...S.card, display: "flex", overflow: "hidden" }}
      >
        {[
          { label: "支出", value: totalE, color: "#FF6B6B" },
          { label: "收入", value: totalI, color: "#60C689" },
          { label: "结余", value: totalI - totalE, color: totalI >= totalE ? "#60C689" : "#FF6B6B" },
        ].map((item, i) => (
          <div key={item.label} style={{
            flex: 1, padding: "16px 12px",
            borderLeft: i > 0 ? "1px solid #F5F5F8" : "none",
            textAlign: "center",
          }}>
            <p style={{ color: "#9EA3B0", fontSize: 11, marginBottom: 4 }}>{item.label}</p>
            <p style={{ color: item.color, fontSize: 17, fontWeight: 800 }}>¥{fmt(Math.abs(item.value))}</p>
          </div>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 8,
          background: "#fff", borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          padding: "11px 14px",
        }}>
          <Search size={15} color="#9EA3B0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索..."
            style={{ background: "none", border: "none", outline: "none", color: "#1A1A2E", fontSize: 14, flex: 1, minWidth: 0 }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilter(!showFilter)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 46, height: 46, borderRadius: 14, border: "none", cursor: "pointer",
            background: showFilter ? "#FF6B6B" : "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <SlidersHorizontal size={18} color={showFilter ? "#fff" : "#9EA3B0"} />
        </motion.button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ ...S.card, padding: 16 }}>
              <p style={{ color: "#9EA3B0", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>类型</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["all", "expense", "income"] as const).map(t => (
                  <motion.button
                    key={t} whileTap={{ scale: 0.92 }}
                    onClick={() => setFilterType(t)}
                    style={{
                      padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                      background: filterType === t ? "#FF6B6B" : "#F2F3F7",
                      color: filterType === t ? "#fff" : "#9EA3B0",
                    }}
                  >{t === "all" ? "全部" : t === "expense" ? "支出" : "收入"}</motion.button>
                ))}
              </div>
              <p style={{ color: "#9EA3B0", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>分类</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setFilterCat("all")}
                  style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: filterCat === "all" ? "#FF6B6B" : "#F2F3F7", color: filterCat === "all" ? "#fff" : "#9EA3B0" }}
                >全部</motion.button>
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.id} whileTap={{ scale: 0.92 }}
                    onClick={() => setFilterCat(cat.id)}
                    style={{
                      padding: "7px 12px", borderRadius: 20, fontSize: 13, border: "none", cursor: "pointer",
                      background: filterCat === cat.id ? cat.bg : "#F2F3F7",
                      color: filterCat === cat.id ? cat.color : "#9EA3B0",
                      fontWeight: filterCat === cat.id ? 700 : 400,
                    }}
                  >{cat.icon} {cat.name}</motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped Transactions */}
      {grouped.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ fontSize: 44 }}>🔍</p>
          <p style={{ color: "#9EA3B0", marginTop: 12, fontSize: 15 }}>没有找到相关记录</p>
        </div>
      ) : (
        grouped.map(([date, txns]) => {
          const dayExp = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingLeft: 4 }}>
                <p style={{ color: "#1A1A2E", fontSize: 13, fontWeight: 700 }}>{formatDateLabel(date)}</p>
                <p style={{ color: "#9EA3B0", fontSize: 12 }}>共 -¥{fmt(dayExp)}</p>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                {txns.map((t, i) => {
                  const cat = CATEGORIES.find(c => c.id === t.category);
                  return (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      style={{
                        display: "flex", alignItems: "center",
                        padding: "13px 16px",
                        borderTop: i > 0 ? "1px solid #F5F5F8" : "none",
                        gap: 12,
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: cat?.bg || "#F5F5F8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, flexShrink: 0,
                      }}>
                        {cat?.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#1A1A2E", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.description}
                        </p>
                        <p style={{ color: "#9EA3B0", fontSize: 12, marginTop: 1 }}>{cat?.name}</p>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ color: t.type === "income" ? "#60C689" : "#1A1A2E", fontSize: 15, fontWeight: 700 }}>
                          {t.type === "income" ? "+" : "-"}¥{fmt(t.amount)}
                        </p>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => onDelete(t.id)}
                          style={{ background: "none", border: "none", color: "#FFB3B3", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 2 }}
                        >删除</motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
