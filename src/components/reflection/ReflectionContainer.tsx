"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmotionInput from "./EmotionInput";
import LoadingBreathing from "./LoadingBreathing";
import ReflectionResults from "./ReflectionResults";
import ReflectionHistory from "./ReflectionHistory";
import { ReflectionResponse, EmotionTag } from "@/types/reflection";
import { toast } from "sonner";

export default function ReflectionContainer() {
  const [step, setStep] = useState<"input" | "loading" | "results">("input");
  const [reflectionData, setReflectionData] =
    useState<ReflectionResponse | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmit = async (data: {
    userInput?: string;
    emotionTag?: EmotionTag;
  }) => {
    setStep("loading");
    try {
      const response = await fetch("/api/ai/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to generate reflection. Please try again.",
        );
      }

      setReflectionData(result);
      setStep("results");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
      setStep("input");
    }
  };

  const handleSelectFromHistory = (data: ReflectionResponse) => {
    setReflectionData(data);
    setStep("results");
  };

  const handleReset = () => {
    setStep("input");
    setReflectionData(null);
  };

  return (
    <div className="">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <EmotionInput onSubmit={handleSubmit} isLoading={false} />
            <ReflectionHistory
              onSelect={handleSelectFromHistory}
              refreshTrigger={refreshTrigger}
            />
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingBreathing />
          </motion.div>
        )}

        {step === "results" && reflectionData && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ReflectionResults data={reflectionData} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
