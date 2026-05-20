"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function LoadingBreathing() {
  const t = useTranslations("reflection");

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-12">
      <div className="relative">
        {/* Pulsing rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-32 h-32 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 bg-primary/30 rounded-full"
          />
        </motion.div>
      </div>

      <div className="text-center space-y-4">
        <motion.h3
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-xl font-medium"
        >
          {t("loading_title")}
        </motion.h3>
        <p className="text-muted-foreground max-w-xs mx-auto italic">
          &quot;{t("loading_subtitle")}&quot;
        </p>
      </div>
    </div>
  );
}
