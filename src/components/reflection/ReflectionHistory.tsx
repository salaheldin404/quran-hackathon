"use client";

import {  useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { History } from "lucide-react";
import { ReflectionResponse } from "@/types/reflection";
import ReflectionHistoryCard from "./ReflectionHistoryCard";

interface HistoryItem {
  id: string;
  emotionTag: string;
  userInput: string | null;
  aiResponse: ReflectionResponse;
  createdAt: string;
}

interface ReflectionHistoryProps {
  onSelect: (data: ReflectionResponse) => void;
  refreshTrigger: number;
}

export default function ReflectionHistory({
  onSelect,
  refreshTrigger,
}: ReflectionHistoryProps) {
  const t = useTranslations("reflection");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/ai/reflection");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger, fetchHistory]);

  const handleDelete = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  },[]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {[1, 2, 3,4].map((i) => (
          <div
            key={i}
            className="min-w-[280px] h-32 rounded-2xl bg-card/50 animate-pulse"
          />
        ))}
      </div>
    );
  }
  if (history.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-4">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t("recent_history")}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        {history.map((item) => (
          <ReflectionHistoryCard
            key={item.id}
            item={item}
            onSelect={onSelect}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
