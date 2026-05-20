"use client";

import { EmotionTag } from "@/types/reflection";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const moods: { tag: EmotionTag; labelKey: string; icon: string }[] = [
  { tag: "anxious", labelKey: "moods.anxious", icon: "😟" },
  { tag: "sad", labelKey: "moods.sad", icon: "😢" },
  { tag: "stressed", labelKey: "moods.stressed", icon: "😫" },
  { tag: "guilty", labelKey: "moods.guilty", icon: "😔" },
  { tag: "lonely", labelKey: "moods.lonely", icon: "👤" },
  { tag: "grateful", labelKey: "moods.grateful", icon: "🙏" },
  { tag: "unmotivated", labelKey: "moods.unmotivated", icon: "🥱" },
  { tag: "hopeful", labelKey: "moods.hopeful", icon: "✨" },
  { tag: "angry", labelKey: "moods.angry", icon: "😠" },
  { tag: "disconnected", labelKey: "moods.disconnected", icon: "📴" },
  { tag: "peaceful", labelKey: "moods.peaceful", icon: "🧘" },
];

interface EmotionInputProps {
  onSubmit: (data: { userInput?: string; emotionTag?: EmotionTag }) => void;
  isLoading: boolean;
}

export default function EmotionInput({ onSubmit, isLoading }: EmotionInputProps) {
  const t = useTranslations("reflection");
  const [userInput, setUserInput] = useState("");
  const [selectedTag, setSelectedTag] = useState<EmotionTag | null>(null);

  const handleSubmit = () => {
    if (!userInput && !selectedTag) return;
    onSubmit({ userInput, emotionTag: selectedTag || undefined });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4">
      <div className="text-center space-y-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
        >
          {t("greeting")}
        </motion.h2>
        <p className="text-muted-foreground text-lg">{t("instruction")}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.tag}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTag(mood.tag)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all border ${
              selectedTag === mood.tag
                ? "bg-primary/20 border-primary shadow-lg shadow-primary/10"
                : "bg-background/50 border-border hover:border-primary/50"
            }`}
          >
            <span className="text-2xl mb-2">{mood.icon}</span>
            <span className="text-xs font-medium">{t(mood.labelKey)}</span>
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder={t("textarea_placeholder")}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="min-h-[120px] rounded-2xl bg-background/50 border-border focus:ring-primary"
          maxLength={300}
         
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!userInput && !selectedTag)}
          className="w-full py-6 rounded-2xl text-lg font-semibold shadow-xl shadow-primary/20"
        >
          {isLoading ? t("analyzing") : t("get_reflection")}
        </Button>
      </div>
    </div>
  );
}
