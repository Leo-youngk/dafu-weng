// ── API Key Storage (Base64 obfuscation) ──

const STORAGE_KEY = "dafu_api_key";

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, btoa(key));
}

export function getApiKey(): string | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return atob(stored);
  } catch {
    return null;
  }
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export function maskApiKey(key: string): string {
  if (key.length <= 12) return "****";
  return key.slice(0, 7) + "..." + key.slice(-4);
}

// ── Claude API Call ──

export type Observation = { icon: string; text: string };

export type MonthlyData = {
  month: string;
  income: number;
  expense: number;
  budget: { total: number; used: number };
  categories: { name: string; amount: number }[];
  topItems: { desc: string; count: number; total: number }[];
};

export async function generateObservations(data: MonthlyData): Promise<Observation[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not configured");

  const prompt = `你是一个个人财务顾问。分析以下月度消费数据，给出 3-5 条简短观察（每条 15-30 字）。
关注：消费结构、异常支出、节省建议、预算执行情况。
用 emoji 开头，语气友好。

数据：
- 月份：${data.month}
- 总收入：¥${data.income.toLocaleString()} | 总支出：¥${data.expense.toLocaleString()} | 结余：¥${(data.income - data.expense).toLocaleString()}
- 预算：¥${data.budget.total.toLocaleString()}（已用 ${data.budget.used.toFixed(0)}%）
- 分类支出：${data.categories.map(c => `${c.name} ¥${c.amount}`).join(", ")}
- 高频消费：${data.topItems.map(i => `${i.desc} ${i.count}次 ¥${i.total}`).join(", ")}

请严格以 JSON 数组格式返回，不要有其他文字：
[{"icon": "emoji", "text": "观察内容"}, ...]`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text = json.content?.[0]?.text || "";

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Invalid response format");

  const observations: Observation[] = JSON.parse(match[0]);
  return observations.slice(0, 5);
}
