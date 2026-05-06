export type Occasion = "birthday" | "anniversary" | "friendship" | "love" | "thanks" | "justbecause";

export interface Surprise {
  id: string;
  occasion: Occasion;
  theme: string;
  fromName: string;
  toName: string;
  title: string;
  message: string;
  photos: string[]; // data URLs
  song: string; // url or empty
  voiceNote: string; // data URL
  revealAt: string; // ISO
  createdAt: string;
}

const KEY = "surprisync.surprises";

export const occasionMeta: Record<Occasion, { label: string; emoji: string; vibe: string; gradient: string }> = {
  birthday: { label: "Birthday", emoji: "🎂", vibe: "Cake, candles & a little chaos", gradient: "from-pink-400 via-rose-400 to-amber-300" },
  anniversary: { label: "Anniversary", emoji: "💍", vibe: "All the years, in one moment", gradient: "from-rose-400 via-fuchsia-400 to-purple-500" },
  friendship: { label: "Friendship", emoji: "🫶", vibe: "For the one who always shows up", gradient: "from-amber-300 via-orange-400 to-pink-400" },
  love: { label: "Love letter", emoji: "💌", vibe: "The words you've been holding in", gradient: "from-pink-400 via-fuchsia-500 to-purple-500" },
  thanks: { label: "Just thank you", emoji: "✨", vibe: "Gratitude, beautifully wrapped", gradient: "from-sky-400 via-indigo-400 to-purple-500" },
  justbecause: { label: "Just because", emoji: "🌷", vibe: "No reason. Every reason.", gradient: "from-fuchsia-400 via-pink-400 to-amber-300" },
};

export const themes = [
  { id: "starlight", name: "Starlight", desc: "Soft cosmos, drifting sparkles", gradient: "from-indigo-500 via-purple-500 to-pink-500" },
  { id: "sunrise", name: "Sunrise", desc: "Golden hour, warm and tender", gradient: "from-amber-300 via-rose-400 to-pink-500" },
  { id: "blossom", name: "Blossom", desc: "Petal pink, gentle wind", gradient: "from-pink-300 via-rose-400 to-fuchsia-500" },
  { id: "ocean", name: "Ocean", desc: "Calm tide, quiet love", gradient: "from-sky-400 via-blue-500 to-indigo-600" },
];

export function loadSurprises(): Surprise[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch { return []; }
}

export function saveSurprise(s: Surprise) {
  const all = loadSurprises();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) all[idx] = s; else all.unshift(s);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getSurprise(id: string): Surprise | undefined {
  return loadSurprises().find((s) => s.id === id);
}

export function newId() {
  return Math.random().toString(36).slice(2, 9);
}
