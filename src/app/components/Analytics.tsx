import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronDown, Calendar, Sparkles, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORIES, EXPENSE_CATS, Transaction, BudgetConfig } from "./data";
import { Theme } from "./themes";
import { InkIllustration } from "./InkIllustration";
import { hasApiKey, generateObservations, Observation, MonthlyData } from "./aiService";

type Props = {
  transactions: Transaction[];
  theme: Theme;
  budget: BudgetConfig;
  showToast: (msg: string) => void;
};

const PieTip = ({ active, payload }: any) => {
  if (active && payload?.length) return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "7px 12px", boxShadow: "0 3px 14px rgba(0,0,0,0.1)", fontSize: 13 }}>
      <span style={{ fontWeight: 600 }}>{payload[0].name}</span>
      <span style={{ color: "#9A9A8A", marginLeft: 6 }}>¥{payload[0].value}</span>
    </div>
  );
  return null;
};

export function Analytics({ transactions, theme: T, budget, showToast }: Props) {
  const [monthIdx, setMonthIdx] = useState(4);
  const [subTab, setSubTab] = useState<"analysis" | "budget">("analysis");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showMoreObs, setShowMoreObs] = useState(false);
  const [showAllTop, setShowAllTop] = useState(false);
  const [expandedBudgetCat, setExpandedBudgetCat] = useState<string | null>(null);

  const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const year = 2026;
  const monthStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;

  const monthTxns = transactions.filter(t => t.date.startsWith(monthStr));
  const income    = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense   = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance   = income - expense;

  // Category breakdown
  const catMap: Record<string, number> = {};
  monthTxns.filter(t => t.type === "expense").forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const catList = Object.entries(catMap)
    .map(([id, val]) => ({ ...CATEGORIES.find(c => c.id === id)!, value: Math.round(val) }))
    .filter(c => c.id).sort((a, b) => b.value - a.value);
  const pieTotal = catList.reduce((s, c) => s + c.value, 0) || expense || 1;

  // TOP descriptions
  const descMap: Record<string, { count: number; total: number; cat: string }> = {};
  monthTxns.filter(t => t.type === "expense").forEach(t => {
    if (!descMap[t.description]) descMap[t.description] = { count: 0, total: 0, cat: t.category };
    descMap[t.description].count++;
    descMap[t.description].total += t.amount;
  });
  const allTop = Object.entries(descMap).sort((a, b) => b[1].count - a[1].count);
  const top5 = showAllTop ? allTop : allTop.slice(0, 5);
  const maxCount = allTop.length > 0 ? allTop[0][1].count : 1;

  // ── AI Observations ──
  const [aiObs, setAiObs] = useState<Record<string, Observation[]>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fallback template observations
  const foodTxns = monthTxns.filter(t => t.category === "food" && t.type === "expense");
  const foodTotal = foodTxns.reduce((s, t) => s + t.amount, 0);
  const fallbackObs: Observation[] = [
    { icon: "🌿", text: `本月支出 ¥${expense.toLocaleString()}，${balance >= 0 ? "结余健康" : "注意超支"}。` },
    ...(foodTxns.length > 0 ? [{ icon: "🍵", text: `饮食消费 ${foodTxns.length} 笔，共 ¥${foodTotal.toFixed(0)}。` }] : []),
    ...(catList[0] ? [{ icon: "📊", text: `${catList[0].name}占比最高 ${((catList[0].value / pieTotal)*100).toFixed(0)}%。` }] : []),
  ];

  const cachedObs = aiObs[monthStr];
  const observations = cachedObs || fallbackObs;

  const fetchAiObs = useCallback(async () => {
    if (aiLoading || aiObs[monthStr]) return;
    setAiLoading(true);
    setAiError(null);

    // Build data for prompt
    const descMap2: Record<string, { count: number; total: number }> = {};
    monthTxns.filter(t => t.type === "expense").forEach(t => {
      if (!descMap2[t.description]) descMap2[t.description] = { count: 0, total: 0 };
      descMap2[t.description].count++;
      descMap2[t.description].total += t.amount;
    });
    const topItems = Object.entries(descMap2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([desc, info]) => ({ desc, count: info.count, total: info.total }));

    const data: MonthlyData = {
      month: `${year}年${monthIdx + 1}月`,
      income,
      expense,
      budget: { total: budget.total, used: budget.total > 0 ? (expense / budget.total) * 100 : 0 },
      categories: catList.map(c => ({ name: c.name, amount: c.value })),
      topItems,
    };

    try {
      const result = await generateObservations(data);
      setAiObs(prev => ({ ...prev, [monthStr]: result }));
    } catch (e: any) {
      setAiError(e.message || "分析失败");
      showToast("AI 分析失败，请检查 API Key");
    } finally {
      setAiLoading(false);
    }
  }, [monthStr, aiLoading, aiObs, monthTxns, year, monthIdx, income, expense, budget, catList, showToast]);

  // Budget data for budget tab
  const budgetPct = budget.total > 0 ? (expense / budget.total) * 100 : 0;
  const budgetRemain = budget.total - expense;

  const barColors = [T.primary, "#8FB87A", "#B8A86C", "#D4956A", "#C0A080"];

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 28 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 12 }}>
        <p style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>统计</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: T.text, fontSize: 14, fontWeight: 500 }}>{year}年{MONTHS[monthIdx]}</span>
            <ChevronDown size={14} color={T.sub} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.text }}>
            <Calendar size={18} />
          </motion.button>
        </div>
      </div>

      {/* ── Month Picker Grid ── */}
      <AnimatePresence>
        {showMonthPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 10 }}
          >
            <div style={{ background: T.card, borderRadius: 14, padding: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {MONTHS.map((m, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.92 }}
                    onClick={() => { setMonthIdx(i); setShowMonthPicker(false); }}
                    style={{
                      padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: i === monthIdx ? 600 : 400,
                      background: i === monthIdx ? T.primary : "transparent",
                      color: i === monthIdx ? "#fff" : T.sub,
                    }}
                  >{m}</motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sub-Tab: 支出分析 | 预算 ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, background: T.card, borderRadius: 10, padding: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {(["analysis", "budget"] as const).map(t => (
          <motion.button key={t} whileTap={{ scale: 0.96 }}
            onClick={() => setSubTab(t)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: subTab === t ? 600 : 400,
              background: subTab === t ? T.primary : "transparent",
              color: subTab === t ? "#fff" : T.sub,
              transition: "all 0.15s",
            }}
          >{t === "analysis" ? "支出分析" : "预算"}</motion.button>
        ))}
      </div>

      {subTab === "analysis" ? (
        /* ════════ ANALYSIS TAB ════════ */
        <>
          {/* Summary Row */}
          <div style={{ background: T.card, borderRadius: 16, display: "flex", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            {[
              { label: "收入", value: income, iconBg: "#E8F5E8", iconColor: T.primary,
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { label: "支出", value: expense, iconBg: "#FFF0EB", iconColor: "#E8734A",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { label: "结余", value: balance, iconBg: "#EEF0FA", iconColor: "#6B7DB3",
                icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
            ].map((item, i) => (
              <div key={item.label} style={{ flex: 1, padding: "14px 8px", textAlign: "center", borderRight: i < 2 ? `1px solid ${T.border}` : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: item.iconColor }}>{item.icon}</div>
                <p style={{ color: T.sub, fontSize: 11 }}>{item.label}</p>
                <p style={{ color: T.text, fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>¥ {Math.abs(item.value).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>

          {/* AI 观察 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ background: T.card, borderRadius: 16, padding: "16px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>AI 观察</span>
                <Sparkles size={14} color={T.primary} />
              </div>
              {hasApiKey() && !cachedObs && !aiLoading && (
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={fetchAiObs}
                  style={{
                    background: `${T.primary}12`, border: `1px solid ${T.primary}30`,
                    borderRadius: 14, cursor: "pointer", color: T.primary,
                    fontSize: 12, fontWeight: 500, padding: "5px 12px",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                  <Sparkles size={11} /> 生成 AI 分析
                </motion.button>
              )}
              {cachedObs && (
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => { setAiObs(prev => { const next = { ...prev }; delete next[monthStr]; return next; }); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.sub, fontSize: 12, display: "flex", alignItems: "center", gap: 2 }}>
                  刷新 <ChevronRight size={13} />
                </motion.button>
              )}
            </div>

            {aiLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px 0" }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 size={18} color={T.primary} />
                </motion.div>
                <span style={{ color: T.sub, fontSize: 13 }}>AI 正在分析...</span>
              </div>
            ) : (
              <>
                {observations.map((obs, i) => (
                  <motion.div key={`${monthStr}-${i}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                    style={{ display: "flex", gap: 8, marginBottom: i < observations.length - 1 ? 10 : 0, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{obs.icon}</span>
                    <p style={{ color: T.sub, fontSize: 13, lineHeight: 1.6 }}>{obs.text}</p>
                  </motion.div>
                ))}
                {!hasApiKey() && (
                  <p style={{ color: T.muted, fontSize: 11, marginTop: 10, textAlign: "center" }}>
                    在设置中配置 API Key 获取 AI 智能洞察
                  </p>
                )}
                {aiError && (
                  <p style={{ color: "#D9534F", fontSize: 11, marginTop: 8 }}>{aiError}</p>
                )}
              </>
            )}
            <div style={{ position: "absolute", right: -10, bottom: -10, opacity: 0.35 }}>
              <InkIllustration width={100} height={80} />
            </div>
          </motion.div>

          {/* 支出分布 */}
          {catList.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
              style={{ background: T.card, borderRadius: 16, padding: "16px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <p style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>支出分布</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart><Pie data={catList} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {catList.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip content={<PieTip />} /></PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                    <p style={{ color: T.text, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>¥ {expense.toLocaleString()}</p>
                    <p style={{ color: T.muted, fontSize: 10 }}>总支出</p>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {catList.slice(0, 5).map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                      <span style={{ color: T.sub, fontSize: 12, minWidth: 28 }}>{item.name}</span>
                      <span style={{ color: T.text, fontSize: 12, fontWeight: 600, minWidth: 28 }}>{((item.value / pieTotal) * 100).toFixed(0)}%</span>
                      <span style={{ color: T.muted, fontSize: 12, textAlign: "right", flex: 1 }}>¥{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 常消费 TOP 5 */}
          {allTop.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: T.card, borderRadius: 16, padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>常消费 TOP 5</p>
                {allTop.length > 5 && (
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAllTop(!showAllTop)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.sub, fontSize: 12, display: "flex", alignItems: "center", gap: 2 }}>
                    {showAllTop ? "收起" : "全部"} <ChevronRight size={13} />
                  </motion.button>
                )}
              </div>
              {top5.map(([desc, info], i) => {
                const cat = CATEGORIES.find(c => c.id === info.cat);
                const barPct = (info.count / maxCount) * 100;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < top5.length - 1 ? 14 : 0 }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{cat?.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span style={{ color: T.text, fontSize: 13 }}>{desc}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: T.sub, fontSize: 12 }}>{info.count}次</span>
                          <span style={{ color: T.text, fontSize: 13, fontWeight: 600, minWidth: 48, textAlign: "right" }}>¥{info.total.toFixed(0)}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: T.inputBg, borderRadius: 3, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                          style={{ height: "100%", background: barColors[i % barColors.length], borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </>
      ) : (
        /* ════════ BUDGET TAB ════════ */
        <>
          {/* Total budget ring */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: T.card, borderRadius: 16, padding: "20px", marginBottom: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center" }}>
            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 16px" }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={[{ value: Math.min(expense, budget.total) }, { value: Math.max(budget.total - expense, 0) }]}
                    cx="50%" cy="50%" innerRadius={48} outerRadius={64} startAngle={90} endAngle={-270}
                    paddingAngle={0} dataKey="value" strokeWidth={0}
                  >
                    <Cell fill={budgetPct > 100 ? "#D9534F" : budgetPct > 80 ? "#E8934A" : T.primary} />
                    <Cell fill={T.inputBg} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <p style={{ color: budgetRemain >= 0 ? T.primary : "#D9534F", fontSize: 16, fontWeight: 700 }}>
                  ¥{Math.abs(budgetRemain).toLocaleString()}
                </p>
                <p style={{ color: T.muted, fontSize: 10 }}>{budgetRemain >= 0 ? "剩余可用" : "已超支"}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
              <div>
                <p style={{ color: T.muted, fontSize: 11 }}>总预算</p>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>¥{budget.total.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: T.muted, fontSize: 11 }}>已使用</p>
                <p style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>¥{expense.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: T.muted, fontSize: 11 }}>使用率</p>
                <p style={{ color: budgetPct > 100 ? "#D9534F" : T.text, fontSize: 15, fontWeight: 600 }}>{budgetPct.toFixed(0)}%</p>
              </div>
            </div>
          </motion.div>

          {/* Per-category budget bars */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ background: T.card, borderRadius: 16, padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <p style={{ color: T.text, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>分类预算</p>
            {EXPENSE_CATS.filter(c => budget.categories[c.id]).map((cat, i) => {
              const catBudget = budget.categories[cat.id] || 0;
              const spent = catMap[cat.id] || 0;
              const pct = catBudget > 0 ? (spent / catBudget) * 100 : 0;
              const color = pct > 100 ? "#D9534F" : pct > 80 ? "#E8934A" : T.primary;
              const isExpanded = expandedBudgetCat === cat.id;
              const catTxns = monthTxns.filter(t => t.type === "expense" && t.category === cat.id);

              return (
                <div key={cat.id} style={{ marginBottom: i < EXPENSE_CATS.filter(c => budget.categories[c.id]).length - 1 ? 16 : 0 }}>
                  <motion.div whileTap={{ scale: 0.98 }}
                    onClick={() => setExpandedBudgetCat(isExpanded ? null : cat.id)}
                    style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span style={{ color: T.text, fontSize: 13, flex: 1 }}>{cat.name}</span>
                      <span style={{ color: color, fontSize: 12, fontWeight: 500 }}>
                        ¥{spent.toLocaleString()} / ¥{catBudget.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: 6, background: T.inputBg, borderRadius: 3, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: color }}
                      />
                    </div>
                  </motion.div>

                  {/* Expanded: recent transactions for this category */}
                  <AnimatePresence>
                    {isExpanded && catTxns.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden", marginTop: 8, paddingLeft: 28 }}
                      >
                        {catTxns.slice(0, 5).map((t, j) => (
                          <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: j < Math.min(catTxns.length, 5) - 1 ? `1px solid ${T.border}` : "none" }}>
                            <span style={{ color: T.sub, fontSize: 12 }}>{t.description}</span>
                            <span style={{ color: T.text, fontSize: 12 }}>-¥{t.amount}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Categories without budget */}
            {EXPENSE_CATS.filter(c => !budget.categories[c.id] && catMap[c.id]).length > 0 && (
              <>
                <div style={{ height: 1, background: T.border, margin: "14px 0" }} />
                <p style={{ color: T.muted, fontSize: 11, marginBottom: 10 }}>未设预算</p>
                {EXPENSE_CATS.filter(c => !budget.categories[c.id] && catMap[c.id]).map(cat => (
                  <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ color: T.sub, fontSize: 13, flex: 1 }}>{cat.name}</span>
                    <span style={{ color: T.text, fontSize: 12 }}>¥{(catMap[cat.id] || 0).toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
