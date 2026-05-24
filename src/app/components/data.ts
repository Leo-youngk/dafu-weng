export type Category = {
  id: string; name: string; icon: string; color: string; bg: string;
};

export type Transaction = {
  id: string; type: "expense" | "income";
  amount: number; category: string; description: string; date: string;
};

export const EXPENSE_CATS: Category[] = [
  { id: "food",     name: "饮食", icon: "🍚", color: "#B07840", bg: "#FAF0E4" },
  { id: "transport",name: "交通", icon: "🚌", color: "#4878A8", bg: "#E8F0FA" },
  { id: "shopping", name: "购物", icon: "🛒", color: "#8060A8", bg: "#F0EAFA" },
  { id: "housing",  name: "居住", icon: "🏠", color: "#5C7A4E", bg: "#EAF0E8" },
  { id: "entertainment", name: "娱乐", icon: "🎮", color: "#A05878", bg: "#FAE8F0" },
  { id: "medical",  name: "医疗", icon: "💊", color: "#4A9890", bg: "#E4F5F2" },
  { id: "education",name: "学习", icon: "📖", color: "#8A7840", bg: "#F5F0E0" },
  { id: "fitness",  name: "健身", icon: "🏃", color: "#5A8840", bg: "#EAF2E0" },
  { id: "pet",      name: "宠物", icon: "🐾", color: "#986040", bg: "#F5EDEA" },
  { id: "other",    name: "其他", icon: "📦", color: "#808070", bg: "#F0F0EA" },
];

export const INCOME_CATS: Category[] = [
  { id: "salary",   name: "工资", icon: "💼", color: "#5C7A4E", bg: "#EAF0E8" },
  { id: "bonus",    name: "奖金", icon: "🎁", color: "#8A7840", bg: "#F5F0E0" },
  { id: "invest",   name: "理财", icon: "📈", color: "#4878A8", bg: "#E8F0FA" },
  { id: "parttime", name: "兼职", icon: "🛠️", color: "#8060A8", bg: "#F0EAFA" },
  { id: "other_in", name: "其他", icon: "📦", color: "#808070", bg: "#F0F0EA" },
];

export const CATEGORIES: Category[] = [...EXPENSE_CATS, ...INCOME_CATS];

export const QUICK_TAGS = [
  { label: "奶茶",   category: "food"      },
  { label: "吃饭",   category: "food"      },
  { label: "咖啡",   category: "food"      },
  { label: "外卖",   category: "food"      },
  { label: "零食",   category: "food"      },
  { label: "水果",   category: "food"      },
  { label: "日用品", category: "shopping"  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1",  type: "expense", amount: 18,   category: "food",      description: "奶茶",     date: "2026-05-24" },
  { id: "2",  type: "expense", amount: 32,   category: "food",      description: "吃饭",     date: "2026-05-24" },
  { id: "3",  type: "expense", amount: 12,   category: "transport", description: "地铁",     date: "2026-05-24" },
  { id: "4",  type: "income",  amount: 8000, category: "salary",    description: "工资",     date: "2026-05-23" },
  { id: "5",  type: "expense", amount: 128,  category: "entertainment", description: "电影", date: "2026-05-22" },
  { id: "6",  type: "expense", amount: 45,   category: "food",      description: "咖啡",     date: "2026-05-22" },
  { id: "7",  type: "expense", amount: 3200, category: "housing",   description: "房租",     date: "2026-05-21" },
  { id: "8",  type: "expense", amount: 188,  category: "fitness",   description: "健身月卡", date: "2026-05-20" },
  { id: "9",  type: "expense", amount: 96,   category: "transport", description: "打车",     date: "2026-05-19" },
  { id: "10", type: "expense", amount: 214,  category: "shopping",  description: "外卖",     date: "2026-05-18" },
];

// ── Budget ──
export type BudgetConfig = {
  total: number;
  categories: Record<string, number>;
};

export const DEFAULT_BUDGET: BudgetConfig = {
  total: 5000,
  categories: {
    food: 2000,
    transport: 500,
    shopping: 800,
    housing: 3500,
    entertainment: 400,
  },
};

export const MONTHLY_SPENDING = [
  { month: "12月", amount: 7200 },
  { month: "1月",  amount: 8100 },
  { month: "2月",  amount: 5800 },
  { month: "3月",  amount: 6600 },
  { month: "4月",  amount: 7900 },
  { month: "5月",  amount: 3720 },
];
