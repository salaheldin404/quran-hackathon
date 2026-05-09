import { createGlassStyle } from "@/lib/utils/galaxy";
import { SurahInfoResource } from "@/types/surah";
import { motion } from "framer-motion";

interface ResourceCardProps {
  resource: SurahInfoResource;
  color: string;
  isArabic: boolean;
}
const ResourceCard = ({ resource, color, isArabic }: ResourceCardProps) => {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          x: isArabic ? -20 : 20,
        },

        visible: {
          opacity: 1,
          x: 0,
        },
      }}
      whileHover={{
        x: isArabic ? 4 : -4,
      }}
      className="
      rounded-xl
      p-4
      transition-all duration-200
      hover:shadow-md
    "
      style={createGlassStyle(color)}
    >
      <p className="text-sm font-semibold" style={{ color }}>
        {resource.name}
      </p>

      <p className="mt-1 text-xs text-neutral-500">{resource.author_name}</p>
    </motion.div>
  );
}

export default ResourceCard
