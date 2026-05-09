import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";
import { Link } from "@/i18n/navigation";

const HomeNav = () => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        href="/"
        aria-label="Home"
        className="
      flex items-center justify-center
      size-8 md:size-12
      rounded-2xl
      bg-white/10
      backdrop-blur-md
      border border-white/20
      hover:bg-white/20
      transition-all duration-200
      pointer-events-auto
      shadow-lg
    "
      >
        <FaHome className="text-lg md:text-xl text-white" />
      </Link>
    </motion.div>
  );
};

export default HomeNav;
