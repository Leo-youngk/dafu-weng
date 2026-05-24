export type Theme = {
  id: string;
  name: string;
  bg: string;
  card: string;
  border: string;
  inputBg: string;
  primary: string;
  primaryDark: string;
  text: string;
  sub: string;
  muted: string;
};

export const THEMES: Theme[] = [
  {
    id: "cream",   name: "米白",
    bg: "#F5F1E8", card: "#FFFFFF", border: "#EDE9DF",
    inputBg: "#F0EDE4", primary: "#5C7A4E", primaryDark: "#4A6340",
    text: "#2A2A22", sub: "#9A9A8A", muted: "#C4C0B4",
  },
  {
    id: "gray",    name: "浅灰",
    bg: "#EFEFED", card: "#FFFFFF", border: "#E4E4E0",
    inputBg: "#E8E8E4", primary: "#5C7A4E", primaryDark: "#4A6340",
    text: "#2A2A2A", sub: "#9A9A9A", muted: "#C4C4C4",
  },
  {
    id: "green",   name: "雾绿",
    bg: "#E8EFEA", card: "#FFFFFF", border: "#DDE8DF",
    inputBg: "#E0EAE2", primary: "#5C7A4E", primaryDark: "#4A6340",
    text: "#2A2A22", sub: "#909A90", muted: "#B8C4BA",
  },
  {
    id: "apricot", name: "淡杏",
    bg: "#F5EDE0", card: "#FFFFFF", border: "#EDE3D4",
    inputBg: "#EEE4D4", primary: "#5C7A4E", primaryDark: "#4A6340",
    text: "#2A2A22", sub: "#9A9080", muted: "#C4B8A8",
  },
  {
    id: "stone",   name: "砂岩",
    bg: "#EDE5D8", card: "#FFFFFF", border: "#E0D8CA",
    inputBg: "#E4DCC8", primary: "#5C7A4E", primaryDark: "#4A6340",
    text: "#2A2A22", sub: "#968E80", muted: "#C0B8A8",
  },
];

export const DEFAULT_THEME = THEMES[0];
