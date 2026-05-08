import { useBreakpoint } from "@/hooks/useBreakPoint";
import { GalaxySurah } from "@/types/galaxy";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { memo, useState } from "react";

type StarProps = {
  surah: GalaxySurah;
  isFilteredView: boolean;
  onClick: () => void;
};

const Star = memo(
  ({
    surah,

    isFilteredView,
    onClick,
  }: StarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isMobile } = useBreakpoint();
    const locale = useLocale();
    const isArabic = locale === "ar";
    const size = isMobile ? 10 : 15;

    // Opacity priority chain for the star itself

    const showLabel = isHovered || isFilteredView;
    const glowStyle = {
      width: size * 2.6,
      height: size * 2.6,

      position: "absolute" as const,

      top: "50%",
      left: "50%",

      transform: "translate(-50%, -50%)",

      borderRadius: "9999px",

      background: `
    radial-gradient(
      circle,
      ${surah.color}55 0%,
      ${surah.color}22 45%,
      transparent 75%
    )
  `,

      filter: `blur(${size * 0.18}px)`,

      opacity: isHovered ? 0.9 : 0.55,

      willChange: "transform, opacity",
    };

    const starStyle = {
      width: size,
      height: size,

      background: surah.color,

      clipPath:
        "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)",

      filter: `
    drop-shadow(0 0 ${size * 0.4}px ${surah.color})
    drop-shadow(0 0 ${size * 0.9}px ${surah.color}88)
  `,
    };

    const labelStyle = {
      color: surah.color,
      fontSize: 9,
      textShadow: "0 0 6px #000",
    };

    const starAnimation = {
      scale: isHovered ? 1.5 : [1, 1.15, 1],
    };
    return (
      <motion.button
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus:outline-none z-10"
        style={{ left: `${surah.position.x}%`, top: `${surah.position.y}%` }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={` ${surah.englishNameTranslation} (${surah.name})`}
        layout="position"
        initial={{
          opacity: 0,
          scale: 0.6,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0,
        }}
        transition={{
          opacity: {
            duration: 0.3,
          },

          scale: {
            duration: 0.3,
          },

          layout: {
            duration: 0.8,
            type: "spring",
            bounce: 0.25,
          },
        }}
        whileHover={{
          scale: 1.15,
          zIndex: 20,
        }}
        whileTap={{
          scale: 0.92,
        }}
      >
        {/* Outer nebula glow */}
        <motion.div
          className="absolute  pointer-events-none"
          style={glowStyle}
          
        />

        {/* Star body */}
        <motion.div
          className="relative rounded-full cursor-pointer"
          style={starStyle}
          animate={starAnimation}
          transition={{
            scale: isHovered
              ? { duration: 0.2 }
              : {
                  duration: 2 + (surah.number % 3) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
            opacity: { duration: 0.4 },
          }}
          whileTap={{ scale: 0.9 }}
        />

        {/* Name label */}
        <motion.span
          className="absolute top-full mt-1 text-center leading-none pointer-events-none select-none whitespace-nowrap"
          style={labelStyle}
          animate={{
            opacity: showLabel ? 1 : 0,
            y: showLabel ? 0 : 4,
          }}
          transition={{ duration: 0.3 }}
        >
          {isArabic ? surah.shortName : surah.englishName}
        </motion.span>
      </motion.button>
    );
  },
);

Star.displayName = "Star";

export default Star;
