import { EmotionTag } from "@/types/reflection";

export const REFLECTION_MOODS: EmotionTag[] = [
  "anxious",
  "sad",
  "stressed",
  "guilty",
  "lonely",
  "grateful",
  "unmotivated",
  "hopeful",
  "angry",
  "disconnected",
  "peaceful",
];

export const UI_THEME_COLORS: Record<EmotionTag, string> = {
  anxious: "#3b82f6", // Blue
  sad: "#6b7280",    // Gray
  stressed: "#ef4444", // Red
  guilty: "#7c3aed",   // Violet
  lonely: "#4b5563",   // Slate
  grateful: "#f59e0b", // Amber
  unmotivated: "#10b981", // Emerald
  hopeful: "#fbbf24",  // Yellow
  angry: "#b91c1c",    // Dark Red
  disconnected: "#4f46e5", // Indigo
  peaceful: "#059669", // Green
};
