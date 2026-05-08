import { createGlassStyle } from "@/lib/utils/galaxy";
import { motion } from "framer-motion";
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}
const StatCard = ({ icon, label, value, color }: StatCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="
      rounded-2xl
      p-4
      backdrop-blur-md
      transition-all duration-300
      hover:shadow-lg
    "
      style={createGlassStyle(color)}
    >
      <div className="mb-2 flex items-center gap-2">
        {icon}

        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
      </div>

      <p className="text-2xl font-bold tracking-tight" style={{ color }}>
        {value}
      </p>
    </motion.div>
  );
};

export default StatCard;
