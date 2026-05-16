"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function HeroSection() {
  const t = useTranslations("Journey");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/20 via-background to-background border border-emerald-500/20 p-8 md:p-12"
    >
      <div className="relative z-10 max-w-2xl space-y-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
        >
          {t("title")}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
{/*       
      <motion.div
        animate={{ 
          rotate: [0, 10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute left-12 top-1/2 -translate-y-1/2 hidden md:block opacity-20"
      >
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0L129.389 70.6107L200 100L129.389 129.389L100 200L70.6107 129.389L0 100L70.6107 70.6107L100 0Z" fill="currentColor" className="text-emerald-500" />
        </svg>
      </motion.div> */}
    </motion.div>
  );
}
