import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Check } from "lucide-react";
import { THEMES, Theme } from "./themes";
import { EXPENSE_CATS, BudgetConfig } from "./data";
import { PickerSheet, PickerOption } from "./PickerSheet";
import { saveApiKey, getApiKey, clearApiKey, hasApiKey, maskApiKey } from "./aiService";

type Props = {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  budget: BudgetConfig;
  onBudgetChange: (b: BudgetConfig) => void;
  showToast: (msg: string) => void;
};

type RowProps = {
  label: string; value?: string; T: Theme; last?: boolean;
  icon: React.ReactNode; toggle?: boolean; toggleValue?: boolean;
  onToggle?: () => void; onClick?: () => void;
};
function Row({ label, value, T, last, icon, toggle, toggleValue, onToggle, onClick }: RowProps) {
  return (
    <motion.div whileTap={{ opacity: 0.6 }}
      onClick={toggle ? onToggle : onClick}
      style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 12, cursor: "pointer",
        borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `${T.primary}10`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: T.primary,
      }}>{icon}</div>
      <span style={{ flex: 1, color: T.text, fontSize: 14 }}>{label}</span>
      {toggle ? (
        <div onClick={e => { e.stopPropagation(); onToggle?.(); }}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: "pointer",
            background: toggleValue ? T.primary : T.border,
            padding: 2, transition: "background 0.2s",
            display: "flex", alignItems: toggleValue ? "center" : "center",
            justifyContent: toggleValue ? "flex-end" : "flex-start",
          }}>
          <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
      ) : (
        <>
          {value && <span style={{ color: T.sub, fontSize: 13 }}>{value}</span>}
          <ChevronRight size={14} color={T.muted} />
        </>
      )}
    </motion.div>
  );
}

// ── Budget Sheet ──
function BudgetSheet({ open, budget, theme: T, onSave, onClose }: {
  open: boolean; budget: BudgetConfig; theme: Theme;
  onSave: (b: BudgetConfig) => void; onClose: () => void;
}) {
  const [total, setTotal] = useState(budget.total.toString());
  const [cats, setCats] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(budget.categories).map(([k, v]) => [k, v.toString()]))
  );

  function save() {
    const newBudget: BudgetConfig = {
      total: Math.max(0, Number(total) || 0),
      categories: Object.fromEntries(
        Object.entries(cats).filter(([, v]) => Number(v) > 0).map(([k, v]) => [k, Number(v)])
      ),
    };
    onSave(newBudget);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 480, margin: "0 auto",
              background: T.card, borderRadius: "20px 20px 0 0",
              zIndex: 1001, paddingBottom: "env(safe-area-inset-bottom, 16px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
              maxHeight: "80vh", display: "flex", flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
            </div>
            <p style={{ textAlign: "center", color: T.text, fontSize: 15, fontWeight: 600, padding: "8px 0 12px" }}>预算设置</p>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {/* Total budget */}
              <p style={{ color: T.sub, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>月度总预算</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ color: T.sub, fontSize: 18 }}>¥</span>
                <input
                  type="number"
                  value={total}
                  onChange={e => setTotal(e.target.value)}
                  style={{
                    flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: "12px 14px",
                    color: T.text, fontSize: 20, fontWeight: 600,
                    outline: "none", fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Per-category budget */}
              <p style={{ color: T.sub, fontSize: 12, fontWeight: 500, marginBottom: 10 }}>分类预算（可选）</p>
              {EXPENSE_CATS.slice(0, 7).map(cat => (
                <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{cat.icon}</span>
                  <span style={{ color: T.text, fontSize: 13, width: 40 }}>{cat.name}</span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: T.muted, fontSize: 13 }}>¥</span>
                    <input
                      type="number"
                      placeholder="不限"
                      value={cats[cat.id] || ""}
                      onChange={e => setCats(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      style={{
                        flex: 1, background: T.inputBg, border: `1px solid ${T.border}`,
                        borderRadius: 8, padding: "8px 10px",
                        color: T.text, fontSize: 14,
                        outline: "none", fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Save */}
            <div style={{ padding: "12px 20px" }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={save}
                style={{
                  width: "100%", padding: "13px", background: T.primary,
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 500, cursor: "pointer",
                }}>保存</motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── API Key Sheet ──
function ApiKeySheet({ open, theme: T, onClose, showToast }: {
  open: boolean; theme: Theme; onClose: () => void; showToast: (msg: string) => void;
}) {
  const [inputKey, setInputKey] = useState("");
  const [configured, setConfigured] = useState(hasApiKey());
  const currentKey = getApiKey();

  useEffect(() => {
    if (open) setConfigured(hasApiKey());
  }, [open]);

  function save() {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    saveApiKey(trimmed);
    setConfigured(true);
    setInputKey("");
    showToast("API Key 已保存");
    onClose();
  }

  function clear() {
    clearApiKey();
    setConfigured(false);
    setInputKey("");
    showToast("API Key 已清除");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1000 }} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 480, margin: "0 auto",
              background: T.card, borderRadius: "20px 20px 0 0",
              zIndex: 1001, paddingBottom: "env(safe-area-inset-bottom, 16px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
            </div>
            <p style={{ textAlign: "center", color: T.text, fontSize: 15, fontWeight: 600, padding: "8px 0 6px" }}>AI 分析设置</p>
            <p style={{ textAlign: "center", color: T.muted, fontSize: 12, padding: "0 20px 16px", lineHeight: 1.5 }}>
              输入 Anthropic API Key，用于生成智能消费洞察
            </p>

            <div style={{ padding: "0 20px" }}>
              {configured && currentKey && (
                <p style={{ color: T.sub, fontSize: 12, marginBottom: 8 }}>
                  当前：{maskApiKey(currentKey)}
                </p>
              )}
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder={configured ? "输入新 Key 替换..." : "sk-ant-api03-..."}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: T.inputBg, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "12px 14px",
                  color: T.text, fontSize: 14,
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={save}
                  style={{
                    flex: 1, padding: "13px", background: T.primary,
                    border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 15, fontWeight: 500, cursor: "pointer",
                    opacity: inputKey.trim() ? 1 : 0.5,
                  }}>保存</motion.button>
                {configured && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={clear}
                    style={{
                      padding: "13px 20px", background: "none",
                      border: `1px solid ${T.border}`, borderRadius: 12,
                      color: "#D9534F", fontSize: 15, fontWeight: 500, cursor: "pointer",
                    }}>清除</motion.button>
                )}
              </div>
              <p style={{ color: T.muted, fontSize: 11, textAlign: "center", marginTop: 14, marginBottom: 8, lineHeight: 1.5 }}>
                Key 仅存储在本设备，不会上传至任何服务器
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Settings Component ──
export function Settings({ theme: T, onThemeChange, budget, onBudgetChange, showToast }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [showBudgetSheet, setShowBudgetSheet] = useState(false);
  const [showApiKeySheet, setShowApiKeySheet] = useState(false);
  const [defaultCat, setDefaultCat] = useState("food");
  const [currency, setCurrency] = useState("cny");
  const [fontSize, setFontSize] = useState("standard");

  // Picker states
  const [pickerOpen, setPickerOpen] = useState<"category" | "currency" | "fontSize" | null>(null);

  const categoryOptions: PickerOption[] = EXPENSE_CATS.map(c => ({ id: c.id, label: c.name, icon: c.icon }));
  const currencyOptions: PickerOption[] = [
    { id: "cny", label: "人民币 CNY ¥" },
    { id: "usd", label: "美元 USD $" },
    { id: "eur", label: "欧元 EUR €" },
    { id: "jpy", label: "日元 JPY ¥" },
    { id: "gbp", label: "英镑 GBP £" },
  ];
  const fontSizeOptions: PickerOption[] = [
    { id: "small", label: "小" },
    { id: "standard", label: "标准" },
    { id: "large", label: "大" },
  ];

  const catDisplay = EXPENSE_CATS.find(c => c.id === defaultCat)?.name || "饮食";
  const currencyDisplay = currencyOptions.find(c => c.id === currency)?.label.split(" ")[0] || "人民币";
  const fontDisplay = fontSizeOptions.find(f => f.id === fontSize)?.label || "标准";

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ paddingTop: 20, paddingBottom: 16, textAlign: "center" }}>
        <p style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>设置</p>
      </div>

      {/* 账户与数据 */}
      <p style={{ color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>账户与数据</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: T.card, borderRadius: 16, overflow: "hidden", marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Row label="账户管理" T={T} onClick={() => showToast("功能开发中")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>} />
        <Row label="预算设置" T={T} onClick={() => setShowBudgetSheet(true)}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M4 9h16M9 9v11" stroke="currentColor" strokeWidth="1.6"/></svg>} />
        <Row label="数据导出" T={T} onClick={() => showToast("功能开发中")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M12 15l-4-4M12 15l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <Row label="回收站" T={T} last onClick={() => showToast("功能开发中")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
      </motion.div>

      {/* 偏好设置 */}
      <p style={{ color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>偏好设置</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        style={{ background: T.card, borderRadius: 16, overflow: "hidden", marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Row label="记账提醒" value="每天 20:00" T={T} onClick={() => showToast("提醒功能开发中")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <Row label="默认分类" value={catDisplay} T={T} onClick={() => setPickerOpen("category")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <Row label="货币单位" value={currencyDisplay} T={T} onClick={() => setPickerOpen("currency")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v10M9 10h6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>} />
        <Row label="AI 分析" value={hasApiKey() ? "已配置" : "未配置"} T={T} onClick={() => setShowApiKeySheet(true)}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <Row label="密码与安全" T={T} last onClick={() => showToast("功能开发中")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>} />
      </motion.div>

      {/* 主题与外观 */}
      <p style={{ color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>主题与外观</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ background: T.card, borderRadius: 16, padding: "16px", marginBottom: 18, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <p style={{ color: T.text, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>主题背景</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {THEMES.map(th => {
            const active = th.id === T.id;
            return (
              <motion.button key={th.id} whileTap={{ scale: 0.9 }}
                onClick={() => onThemeChange(th)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{
                  width: "100%", aspectRatio: "1 / 1", borderRadius: 10,
                  background: th.bg,
                  border: active ? `2px solid ${T.primary}` : `2px solid transparent`,
                  boxShadow: active ? `0 0 0 1px ${T.primary}40` : "0 1px 4px rgba(0,0,0,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border 0.15s",
                }}>
                  {active && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      style={{ width: 18, height: 18, borderRadius: "50%", background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: active ? T.primary : T.sub, fontWeight: active ? 600 : 400 }}>{th.name}</span>
              </motion.button>
            );
          })}
        </div>
        <div style={{ borderTop: `1px solid ${T.border}`, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, paddingTop: 2 }}>
          <Row label="字体大小" value={fontDisplay} T={T} onClick={() => setPickerOpen("fontSize")}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 20h16M7 8l5-5 5 5M12 3v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
          <Row label="深色模式" T={T} last toggle toggleValue={darkMode} onToggle={() => setDarkMode(!darkMode)}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        </div>
      </motion.div>

      {/* 关于 */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ background: T.card, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <Row label="关于我们" T={T} last onClick={() => showToast("大富翁记账 v1.0.0")}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v1M12 12v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>} />
      </motion.div>

      {/* ── Budget Sheet ── */}
      <BudgetSheet
        open={showBudgetSheet}
        budget={budget}
        theme={T}
        onSave={onBudgetChange}
        onClose={() => setShowBudgetSheet(false)}
      />

      {/* ── Picker Sheets ── */}
      <PickerSheet
        open={pickerOpen === "category"}
        title="选择默认分类"
        options={categoryOptions}
        selected={defaultCat}
        theme={T}
        onSelect={setDefaultCat}
        onClose={() => setPickerOpen(null)}
      />
      <PickerSheet
        open={pickerOpen === "currency"}
        title="选择货币单位"
        options={currencyOptions}
        selected={currency}
        theme={T}
        onSelect={setCurrency}
        onClose={() => setPickerOpen(null)}
      />
      <PickerSheet
        open={pickerOpen === "fontSize"}
        title="选择字体大小"
        options={fontSizeOptions}
        selected={fontSize}
        theme={T}
        onSelect={setFontSize}
        onClose={() => setPickerOpen(null)}
      />

      {/* ── API Key Sheet ── */}
      <ApiKeySheet
        open={showApiKeySheet}
        theme={T}
        onClose={() => setShowApiKeySheet(false)}
        showToast={showToast}
      />
    </div>
  );
}
