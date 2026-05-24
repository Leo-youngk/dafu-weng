import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Check, Delete } from "lucide-react";
import { EXPENSE_CATS, INCOME_CATS, QUICK_TAGS, Transaction, BudgetConfig, CATEGORIES } from "./data";
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
  const [showKeypad, setShowKeypad] = useState(false);

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

  const hasTags = type === "expense" && (QUICK_TAGS[category] || []).length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px 0", flexShrink: 0,
      }}>
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.sub }}>
          <ChevronLeft size={22} />
        </motion.button>
        <span style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>记录一笔</span>
        <div style={{ width: 30 }} />
      </div>

      {/* ── Scrollable content ── */}
      <div style={{
        flex: 1, overflowY: "auto", minHeight: 0,
        display: "flex", flexDirection: "column",
        justifyContent: showKeypad ? "flex-start" : "center",
        padding: "0 24px",
        transition: "justify-content 0.2s",
      }}>
        <div style={{ maxWidth: "100%" }}>

          {/* ── Amount Hero ── */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowKeypad(true)}
            style={{
              textAlign: "center",
              padding: showKeypad ? "8px 0 16px" : "24px 0 28px",
              cursor: "pointer",
              transition: "padding 0.3s ease",
            }}
          >
            {/* Type toggle — pill style */}
            <div style={{
              display: "inline-flex", gap: 0,
              background: T.card, borderRadius: 20, padding: 3,
              marginBottom: showKeypad ? 12 : 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {(["expense", "income"] as const).map(t => (
                <motion.button key={t} whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); switchType(t); }}
                  style={{
                    padding: "6px 24px", borderRadius: 18, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 500,
                    background: type === t ? T.primary : "transparent",
                    color: type === t ? "#fff" : T.sub,
                    transition: "all 0.15s",
                  }}
                >{t === "expense" ? "支出" : "收入"}</motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={done ? "done" : (amount || "0")}
                initial={{ opacity: 0.6, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}
              >
                <span style={{ color: T.sub, fontSize: 22, fontWeight: 300 }}>¥</span>
                <span style={{
                  fontSize: showKeypad ? 44 : 52, fontWeight: 200, letterSpacing: -2,
                  color: done ? T.primary : amount ? T.text : T.muted,
                  fontVariantNumeric: "tabular-nums", lineHeight: 1,
                  transition: "font-size 0.3s ease",
                }}>
                  {done ? "✓" : (amount || "0.00")}
                </span>
              </motion.div>
            </AnimatePresence>

            {!showKeypad && !amount && !done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ color: T.muted, fontSize: 12, marginTop: 8, letterSpacing: 0.5 }}
              >
                点击输入金额
              </motion.p>
            )}
          </motion.div>

          {/* ── Category Grid ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
            }}>
              {displayCats.map(cat => {
                const active = category === cat.id;
                return (
                  <motion.button key={cat.id} whileTap={{ scale: 0.88 }}
                    onClick={() => { setCategory(cat.id); setSelectedTags([]); setShowKeypad(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "10px 4px", borderRadius: 14, border: "none", cursor: "pointer",
                      background: active ? cat.bg : "transparent",
                      transition: "all 0.14s",
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: active ? `${cat.color}20` : T.card,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, boxShadow: active ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
                    }}>
                      {cat.icon}
                    </div>
                    <span style={{ fontSize: 11, color: active ? cat.color : T.sub, fontWeight: active ? 600 : 400 }}>
                      {cat.name}
                    </span>
                  </motion.button>
                );
              })}
              {/* Expand button */}
              {!showAllCats && cats.length > 5 && (
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowAllCats(true)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "10px 4px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: "transparent",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: T.card, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="5" cy="12" r="2" fill={T.muted} />
                      <circle cx="12" cy="12" r="2" fill={T.muted} />
                      <circle cx="19" cy="12" r="2" fill={T.muted} />
                    </svg>
                  </div>
                  <span style={{ fontSize: 11, color: T.sub }}>更多</span>
                </motion.button>
              )}
            </div>

            {/* Budget hint */}
            {type === "expense" && catBudget && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  fontSize: 11, marginTop: 8, paddingLeft: 2, textAlign: "center",
                  color: catPct > 100 ? "#D9534F" : catPct > 80 ? "#E8934A" : T.primary,
                }}
              >
                {activeCat.name}本月已用 ¥{catSpent.toLocaleString()}/¥{catBudget.toLocaleString()}
                {catPct > 100 && " · 已超支"}
                {catPct > 80 && catPct <= 100 && " · 接近上限"}
              </motion.p>
            )}
          </div>

          {/* ── Tags ── */}
          {hasTags && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(QUICK_TAGS[category] || []).map(tag => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <motion.button
                      key={tag} whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                        background: isActive ? `${T.primary}15` : T.card,
                        color: isActive ? T.primary : T.sub,
                        fontWeight: isActive ? 600 : 400,
                        outline: isActive ? `1.5px solid ${T.primary}40` : "none",
                        boxShadow: isActive ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      {tag}
                    </motion.button>
                  );
                })}
                {/* Custom tags */}
                {selectedTags.filter(t => !(QUICK_TAGS[category] || []).includes(t)).map(tag => (
                  <motion.button key={tag} whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                      background: `${T.primary}15`, color: T.primary, fontWeight: 600,
                      outline: `1.5px solid ${T.primary}40`,
                    }}
                  >
                    {tag} ✕
                  </motion.button>
                ))}
                {/* Custom tag input */}
                {!customTagInput ? (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setCustomTagInput(true)}
                    style={{
                      padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
                      background: T.card, color: T.muted,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >+ 自定义</motion.button>
                ) : (
                  <motion.div
                    initial={{ width: 60 }} animate={{ width: 140 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      background: T.card, borderRadius: 20, padding: "3px 6px 3px 14px",
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
                        color: T.text, fontSize: 13, width: "100%",
                        fontFamily: "inherit",
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ── Note ── */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              value={note}
              onChange={e => { if (e.target.value.length <= 50) setNote(e.target.value); }}
              onFocus={() => setShowKeypad(false)}
              placeholder="添加备注..."
              style={{
                width: "100%", boxSizing: "border-box",
                background: T.card, border: "none",
                borderRadius: 14, padding: "13px 50px 13px 16px",
                color: T.text, fontSize: 14,
                outline: "none", caretColor: T.primary,
                fontFamily: "inherit",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            />
            <span style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              color: T.muted, fontSize: 10,
            }}>{charCount}/50</span>
          </div>
        </div>
      </div>

      {/* ── Confirm Button (visible when keypad hidden & amount entered) ── */}
      <AnimatePresence>
        {!showKeypad && amount && +amount > 0 && !done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ flexShrink: 0, padding: "0 24px 24px" }}
          >
            <motion.button whileTap={{ scale: 0.97 }} onClick={submit}
              style={{
                width: "100%", padding: "15px",
                background: T.primary, border: "none", borderRadius: 16,
                color: "#fff", fontSize: 16, fontWeight: 600,
                cursor: "pointer",
                boxShadow: `0 4px 16px ${T.primary}44`,
              }}
            >
              保存 · ¥{amount}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Number Pad — slide up when active ── */}
      <AnimatePresence>
        {showKeypad && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            style={{ flexShrink: 0, overflow: "hidden" }}
          >
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
              background: T.border, borderRadius: "16px 16px 0 0", overflow: "hidden",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
            }}>
              {["1","2","3","del","4","5","6",".",  "7","8","9","0"].map(key => (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.92, backgroundColor: `${T.primary}12` }}
                  onClick={() => handleKeyPress(key)}
                  style={{
                    padding: "14px 0",
                    background: T.card,
                    border: "none", cursor: "pointer",
                    fontSize: key === "del" ? 0 : 20,
                    fontWeight: 300,
                    color: T.text,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "inherit",
                  }}
                >
                  {key === "del" ? <Delete size={20} color={T.sub} /> : key}
                </motion.button>
              ))}
              {/* Bottom row: confirm button spans full width */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (amount && +amount > 0) submit(); else setShowKeypad(false); }}
                style={{
                  gridColumn: "1 / -1",
                  padding: "13px 0",
                  background: amount && +amount > 0 ? T.primary : T.card,
                  border: "none", cursor: "pointer",
                  fontSize: 15, fontWeight: 600,
                  color: amount && +amount > 0 ? "#fff" : T.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "inherit",
                }}
              >
                {amount && +amount > 0 ? `完成 · ¥${amount}` : "收起键盘"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
