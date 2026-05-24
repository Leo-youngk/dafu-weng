import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Check, Delete } from "lucide-react";
import { EXPENSE_CATS, INCOME_CATS, QUICK_TAGS, Transaction, BudgetConfig } from "./data";
import { Theme } from "./themes";

type Props = {
  onAdd: (t: Omit<Transaction, "id">) => void;
  theme: Theme;
  onBack: () => void;
  budget: BudgetConfig;
  transactions: Transaction[];
};

const THIS_MONTH = new Date().toISOString().slice(0, 7);

export function AddTransaction({ onAdd, theme: T, onBack, budget, transactions }: Props) {
  const [type, setType]         = useState<"expense" | "income">("expense");
  const [amount, setAmount]     = useState("");
  const [note, setNote]         = useState("");
  const [category, setCategory] = useState("food");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllCats, setShowAllCats] = useState(false);
  const [customTagInput, setCustomTagInput] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [date]                  = useState(new Date().toISOString().slice(0, 10));
  const [done, setDone]         = useState(false);

  const cats      = type === "expense" ? EXPENSE_CATS : INCOME_CATS;
  const activeCat = cats.find(c => c.id === category) ?? cats[0];
  const charCount = note.length;

  // Budget calculation for current category
  const catBudget = budget.categories[category];
  const catSpent  = transactions
    .filter(t => t.date.startsWith(THIS_MONTH) && t.type === "expense" && t.category === category)
    .reduce((s, t) => s + t.amount, 0);
  const catPct    = catBudget ? (catSpent / catBudget) * 100 : 0;

  function submit() {
    if (!amount || +amount <= 0 || done) return;
    const desc = selectedTags.length > 0 ? selectedTags[0] : (note.trim() || activeCat.name);
    onAdd({ type, amount: +amount, description: desc, category: activeCat.id, date });
    setDone(true);
    setTimeout(() => { onBack(); }, 700);
  }

  function switchType(t: "expense" | "income") {
    setType(t);
    setCategory(t === "expense" ? "food" : "salary");
    setAmount(""); setNote(""); setSelectedTags([]);
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function addCustomTag() {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
    }
    setCustomTag("");
    setCustomTagInput(false);
  }

  function handleKeyPress(key: string) {
    if (done) return;
    if (key === "del") {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    if (key === ".") {
      if (amount.includes(".")) return;
      if (!amount) { setAmount("0."); return; }
    }
    const next = amount + key;
    const parts = next.split(".");
    if (parts[1] && parts[1].length > 2) return;
    if (parts[0].length > 6) return;
    setAmount(next);
  }

  const displayCats = showAllCats ? cats : cats.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg, padding: "0 20px" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0 8px", flexShrink: 0,
      }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.sub }}>
          <ChevronLeft size={22} />
        </motion.button>
        <span style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>记录一笔</span>
        <motion.button whileTap={{ scale: 0.88 }} onClick={submit}
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: amount && +amount > 0 ? T.primary : T.muted,
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
          <Check size={16} color="#fff" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* ── Scrollable content (above keyboard) ── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

        {/* Amount display */}
        <div style={{ textAlign: "center", padding: "8px 0 14px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={done ? "done" : (amount || "0")}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}
            >
              <span style={{ color: T.sub, fontSize: 22, fontWeight: 300 }}>¥</span>
              <span style={{
                fontSize: 48, fontWeight: 300, letterSpacing: -2,
                color: done ? T.primary : amount ? T.text : T.muted,
                fontVariantNumeric: "tabular-nums", lineHeight: 1,
              }}>
                {done ? "✓" : (amount || "0")}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Type toggle — equal buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {(["expense", "income"] as const).map(t => (
            <motion.button key={t} whileTap={{ scale: 0.95 }}
              onClick={() => switchType(t)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500,
                background: type === t ? T.primary : T.card,
                color: type === t ? "#fff" : T.sub,
                boxShadow: type === t ? `0 2px 10px ${T.primary}44` : "none",
                transition: "all 0.15s",
              }}
            >{t === "expense" ? "支出" : "收入"}</motion.button>
          ))}
        </div>

        {/* Category section */}
        <p style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>分类</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 6,
          marginBottom: 4,
        }}>
          {displayCats.map(cat => {
            const active = category === cat.id;
            return (
              <motion.button key={cat.id} whileTap={{ scale: 0.88 }} onClick={() => setCategory(cat.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "8px 2px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: active ? cat.bg : "transparent",
                  transition: "all 0.14s",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: active ? `${cat.color}20` : T.card,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                  {cat.icon}
                </div>
                <span style={{ fontSize: 10, color: active ? cat.color : T.sub, fontWeight: active ? 600 : 400 }}>
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
          {/* 其他/展开 button */}
          {!showAllCats && cats.length > 5 && (
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowAllCats(true)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "8px 2px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "transparent",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: T.card, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="5" cy="12" r="2" fill={T.muted} />
                  <circle cx="12" cy="12" r="2" fill={T.muted} />
                  <circle cx="19" cy="12" r="2" fill={T.muted} />
                </svg>
              </div>
              <span style={{ fontSize: 10, color: T.sub }}>其他</span>
            </motion.button>
          )}
        </div>

        {/* Budget hint for selected category */}
        {type === "expense" && catBudget && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: 11, marginBottom: 14, marginTop: 4, paddingLeft: 2,
              color: catPct > 100 ? "#D9534F" : catPct > 80 ? "#E8934A" : T.primary,
            }}
          >
            {activeCat.name}本月已用 ¥{catSpent.toLocaleString()}/¥{catBudget.toLocaleString()}
            {catPct > 100 && " · 已超支"}
            {catPct > 80 && catPct <= 100 && " · 接近上限"}
          </motion.p>
        )}
        {type === "expense" && !catBudget && (
          <div style={{ height: 14, marginBottom: 4 }} />
        )}

        {/* Tags (multi-select) */}
        {type === "expense" && (
          <>
            <p style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              标签 <span style={{ fontWeight: 400, color: T.muted, fontSize: 11 }}>（可多选）</span>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {QUICK_TAGS.map(tag => {
                const cat = EXPENSE_CATS.find(c => c.id === tag.category);
                const isActive = selectedTags.includes(tag.label);
                return (
                  <motion.button
                    key={tag.label} whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTag(tag.label)}
                    style={{
                      padding: "6px 12px", borderRadius: 18, border: "none", cursor: "pointer", fontSize: 12,
                      background: isActive ? `${T.primary}15` : T.card,
                      color: isActive ? T.primary : T.sub,
                      fontWeight: isActive ? 600 : 400,
                      outline: isActive ? `1.5px solid ${T.primary}40` : "none",
                      display: "flex", alignItems: "center", gap: 4,
                      boxShadow: isActive ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    {cat && <span style={{ fontSize: 12 }}>{cat.icon}</span>}
                    {tag.label}
                  </motion.button>
                );
              })}
              {/* Custom tag display */}
              {selectedTags.filter(t => !QUICK_TAGS.some(q => q.label === t)).map(tag => (
                <motion.button key={tag} whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "6px 12px", borderRadius: 18, border: "none", cursor: "pointer", fontSize: 12,
                    background: `${T.primary}15`, color: T.primary, fontWeight: 600,
                    outline: `1.5px solid ${T.primary}40`,
                  }}
                >
                  {tag} ✕
                </motion.button>
              ))}
              {/* 其他 — add custom tag */}
              {!customTagInput ? (
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => setCustomTagInput(true)}
                  style={{
                    padding: "6px 12px", borderRadius: 18, border: "none", cursor: "pointer", fontSize: 12,
                    background: T.card, color: T.sub,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >其他</motion.button>
              ) : (
                <motion.div
                  initial={{ width: 48 }} animate={{ width: 140 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: T.card, borderRadius: 18, padding: "2px 4px 2px 12px",
                    outline: `1.5px solid ${T.primary}40`,
                  }}
                >
                  <input
                    autoFocus
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value.slice(0, 10))}
                    onKeyDown={e => e.key === "Enter" && addCustomTag()}
                    onBlur={addCustomTag}
                    placeholder="自定义..."
                    style={{
                      border: "none", outline: "none", background: "none",
                      color: T.text, fontSize: 12, width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* Note */}
        <p style={{ color: T.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          备注 <span style={{ fontWeight: 400, color: T.muted, fontSize: 11 }}>（可选）</span>
        </p>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            value={note}
            onChange={e => { if (e.target.value.length <= 50) setNote(e.target.value); }}
            placeholder="例如：霸王茶姬"
            style={{
              width: "100%", boxSizing: "border-box",
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: 12, padding: "11px 50px 11px 14px",
              color: T.text, fontSize: 13,
              outline: "none", caretColor: T.primary,
              fontFamily: "inherit",
            }}
          />
          <span style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            color: T.muted, fontSize: 10,
          }}>{charCount}/50</span>
        </div>
      </div>

      {/* ── Number Pad — FIXED at bottom ── */}
      <div style={{
        flexShrink: 0,
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
        background: T.border, borderRadius: "14px 14px 0 0", overflow: "hidden",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
      }}>
        {["1","2","3","4","5","6","7","8","9",".","0","del"].map(key => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.92, backgroundColor: `${T.primary}15` }}
            onClick={() => handleKeyPress(key)}
            style={{
              padding: "14px 0",
              background: T.card,
              border: "none", cursor: "pointer",
              fontSize: key === "del" ? 0 : 20,
              fontWeight: 400,
              color: T.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            {key === "del" ? <Delete size={18} color={T.sub} /> : key}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
