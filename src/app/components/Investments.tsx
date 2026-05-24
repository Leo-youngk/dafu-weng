import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Investment } from "./data";

type Props = {
  investments: Investment[];
  onAdd: (inv: Omit<Investment, "id">) => void;
  onDelete: (id: string) => void;
};

const S = {
  card: { background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" } as React.CSSProperties,
};
const PALETTE = ["#FF6B6B", "#5B9EF0", "#60C689", "#A78BFA", "#FFD93D", "#4ECDC4"];

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PieTip = ({ active, payload }: any) => {
  if (active && payload?.length) return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "8px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
      <p style={{ color: "#1A1A2E", fontSize: 13, fontWeight: 700 }}>{payload[0].name}</p>
      <p style={{ color: "#9EA3B0", fontSize: 12 }}>¥{fmt(payload[0].value)}</p>
    </div>
  );
  return null;
};

export function Investments({ investments, onAdd, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", ticker: "", shares: "", buyPrice: "", currentPrice: "", color: PALETTE[0] });

  const totalValue = investments.reduce((s, i) => s + i.shares * i.currentPrice, 0);
  const totalCost  = investments.reduce((s, i) => s + i.shares * i.buyPrice, 0);
  const totalGain  = totalValue - totalCost;
  const gainPct    = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const isUp       = totalGain >= 0;

  const pieData = investments.map(i => ({ name: i.name, value: +(i.shares * i.currentPrice).toFixed(2), color: i.color }));

  function submit() {
    if (!form.name || !form.shares || !form.buyPrice || !form.currentPrice) return;
    onAdd({ name: form.name, ticker: form.ticker, shares: +form.shares, buyPrice: +form.buyPrice, currentPrice: +form.currentPrice, color: form.color });
    setForm({ name: "", ticker: "", shares: "", buyPrice: "", currentPrice: "", color: PALETTE[0] });
    setShowAdd(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8 }}>
        <div>
          <h1 style={{ color: "#1A1A2E", fontSize: 22, fontWeight: 800 }}>投资组合</h1>
          <p style={{ color: "#9EA3B0", fontSize: 13, marginTop: 2 }}>追踪你的每笔投资</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#FF6B6B", borderRadius: 20, padding: "9px 18px", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,107,107,0.35)" }}
        >
          <Plus size={15} /> 添加
        </motion.button>
      </div>

      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(145deg, #1A1A2E 0%, #2D2D4E 100%)",
          borderRadius: 24, padding: "24px",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginBottom: 6 }}>投资总市值</p>
        <p style={{ color: "#fff", fontSize: 38, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
          <span style={{ fontSize: 20, fontWeight: 600 }}>¥</span>{fmt(totalValue)}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <span style={{ background: isUp ? "rgba(96,198,137,0.2)" : "rgba(255,107,107,0.2)", color: isUp ? "#60C689" : "#FF6B6B", borderRadius: 8, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
            {isUp ? "+" : ""}{gainPct.toFixed(2)}%
          </span>
          <span style={{ color: isUp ? "#60C689" : "#FF6B6B", fontSize: 13 }}>
            {isUp ? "↑ +" : "↓ "}¥{fmt(Math.abs(totalGain))}
          </span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>总成本</p>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>¥{fmt(totalCost)}</p>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>持仓数</p>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{investments.length} 只</p>
          </div>
        </div>
      </motion.div>

      {/* Allocation */}
      {investments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ ...S.card, padding: "20px" }}
        >
          <p style={{ color: "#1A1A2E", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>资产配置</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              {pieData.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                  <span style={{ color: "#9EA3B0", fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                  <span style={{ color: "#1A1A2E", fontSize: 12, fontWeight: 700 }}>
                    {((e.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Holdings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {investments.map((inv, i) => {
          const val   = inv.shares * inv.currentPrice;
          const cost  = inv.shares * inv.buyPrice;
          const gain  = val - cost;
          const gpct  = (gain / cost) * 100;
          const up    = gain >= 0;
          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ ...S.card, padding: "16px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, flex: 1, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${inv.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: inv.color, fontSize: 11, fontWeight: 900 }}>{inv.ticker.slice(0, 3)}</span>
                  </div>
                  <div>
                    <p style={{ color: "#1A1A2E", fontSize: 14, fontWeight: 700 }}>{inv.name}</p>
                    <p style={{ color: "#9EA3B0", fontSize: 12 }}>{inv.ticker} · {inv.shares}份</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: "#1A1A2E", fontSize: 15, fontWeight: 800 }}>¥{fmt(val)}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, marginTop: 2 }}>
                    {up ? <TrendingUp size={11} color="#60C689" /> : <TrendingDown size={11} color="#FF6B6B" />}
                    <span style={{ color: up ? "#60C689" : "#FF6B6B", fontSize: 12, fontWeight: 700 }}>
                      {up ? "+" : ""}{gpct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 12, height: 3, background: "#F5F5F8", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, 50 + gpct * 2))}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: "easeOut" }}
                  style={{ height: "100%", background: up ? "#60C689" : "#FF6B6B", borderRadius: 2 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                <span style={{ color: "#9EA3B0", fontSize: 11 }}>成本 ¥{inv.buyPrice} / 现价 ¥{inv.currentPrice}</span>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => onDelete(inv.id)} style={{ background: "none", border: "none", color: "#FFB3B3", fontSize: 11, cursor: "pointer", padding: 0 }}>删除</motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              style={{ background: "#fff", borderRadius: "28px 28px 0 0", padding: "0 24px 40px", width: "100%", maxWidth: 480 }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "#EEEEF2" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ color: "#1A1A2E", fontSize: 18, fontWeight: 800 }}>添加持仓</h2>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowAdd(false)} style={{ background: "#F2F3F7", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} color="#9EA3B0" />
                </motion.button>
              </div>

              {[
                { key: "name",         label: "名称",       placeholder: "如：沪深300ETF",  type: "text" },
                { key: "ticker",       label: "代码",       placeholder: "如：510300",      type: "text" },
                { key: "shares",       label: "持仓数量",   placeholder: "如：2000",        type: "number" },
                { key: "buyPrice",     label: "成本价（元）", placeholder: "如：3.85",      type: "number" },
                { key: "currentPrice", label: "现价（元）", placeholder: "如：4.12",        type: "number" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <p style={{ color: "#9EA3B0", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{f.label}</p>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    type={f.type}
                    style={{ width: "100%", background: "#F2F3F7", border: "none", borderRadius: 12, padding: "12px 14px", color: "#1A1A2E", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#9EA3B0", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>标记颜色</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {PALETTE.map(c => (
                    <motion.div key={c} whileTap={{ scale: 0.85 }} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid #1A1A2E" : "3px solid transparent" }}
                    />
                  ))}
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }} onClick={submit}
                style={{ width: "100%", background: "#FF6B6B", borderRadius: 16, padding: "15px", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(255,107,107,0.35)" }}
              >添加持仓</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
