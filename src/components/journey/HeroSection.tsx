"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function HeroSection() {
  const t = useTranslations("Journey");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/20 p-8 md:p-12"
    >
      <div className="relative z-10 max-w-2xl space-y-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          {t("title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm md:text-lg text-muted-foreground leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>
      </div>

      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

    </motion.div>
  );
}
