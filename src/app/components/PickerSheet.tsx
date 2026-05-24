import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { Theme } from "./themes";

export type PickerOption = {
  id: string;
  label: string;
  icon?: string;
};

type PickerSheetProps = {
  open: boolean;
  title: string;
  options: PickerOption[];
  selected: string;
  theme: Theme;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function PickerSheet({ open, title, options, selected, theme: T, onSelect, onClose }: PickerSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
            }}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              maxWidth: 480, margin: "0 auto",
              background: T.card,
              borderRadius: "20px 20px 0 0",
              zIndex: 1001,
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.12)",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
            </div>

            {/* Title */}
            <p style={{ textAlign: "center", color: T.text, fontSize: 15, fontWeight: 600, padding: "8px 0 12px" }}>
              {title}
            </p>

            {/* Options */}
            <div style={{ padding: "0 16px 16px", maxHeight: 320, overflowY: "auto" }}>
              {options.map((opt, i) => {
                const active = opt.id === selected;
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onSelect(opt.id); onClose(); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px",
                      background: active ? `${T.primary}08` : "transparent",
                      border: "none", cursor: "pointer",
                      borderBottom: i < options.length - 1 ? `1px solid ${T.border}` : "none",
                      borderRadius: i === 0 ? "12px 12px 0 0" : i === options.length - 1 ? "0 0 12px 12px" : 0,
                    }}
                  >
                    {opt.icon && <span style={{ fontSize: 18 }}>{opt.icon}</span>}
                    <span style={{ flex: 1, textAlign: "left", color: active ? T.primary : T.text, fontSize: 14, fontWeight: active ? 600 : 400 }}>
                      {opt.label}
                    </span>
                    {active && <Check size={16} color={T.primary} strokeWidth={2.5} />}
                  </motion.button>
                );
              })}
            </div>

            {/* Cancel */}
            <div style={{ padding: "0 16px 8px" }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                style={{
                  width: "100%", padding: "13px",
                  background: T.inputBg, border: "none", borderRadius: 12,
                  color: T.sub, fontSize: 14, fontWeight: 500, cursor: "pointer",
                }}
              >取消</motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
