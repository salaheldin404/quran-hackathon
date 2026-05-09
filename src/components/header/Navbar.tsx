"use client";
// import Search from "./Search";
import SideNav from "./SideNav";
import { Link } from "@/i18n/navigation";

import useScrollDirection from "@/hooks/useScrollDirection";
import QuickAccessNavigation from "../surah/QuickAccessNavigation";
import AuthButton from "./AuthButton";
import { useLocale } from "next-intl";
import NewSearch from "./NewSearch";
import { Badge } from "../ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname } from "@/i18n/navigation";

const Navbar = () => {
  const scrollDirection = useScrollDirection();
  const locale = useLocale();
  const pathname = usePathname();
  const isRTL = locale === "ar";
  useNotifications();
  console.log('pathname:', pathname);
  if (pathname === "/quranicGalaxy") return null;
  return (
    <header
      className={`${scrollDirection === "down" ? "-top-20 md:-top-24" : "top-0"}
          sticky z-50 w-full border-b 
          bg-white/95 dark:bg-muted/95 backdrop-blur-sm
          shadow-sm
          transition-all duration-300 ease-in-out
      `}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <nav className="main-container">
        <div className="flex h-14 sm:h-16 md:h-[70px] items-center justify-between gap-2 sm:gap-3 md:gap-4">
          {/* Logo - Responsive sizing */}
          <Link
            href="/"
            className="group flex-shrink-0 flex items-center gap-1.5 font-bold text-primary
                       text-base sm:text-lg md:text-xl lg:text-2xl
                       hover:opacity-80 transition-opacity duration-200
                       focus-visible:outline-none focus-visible:ring-2 
                       focus-visible:ring-primary focus-visible:ring-offset-2 
                       rounded-sm px-1"
            aria-label="Sakinah Streams Home"
          >
            <span className="hidden min-[400px]:inline">Sakinah Streams</span>
            <span className="inline min-[400px]:hidden">SS</span>
            {/* <Badge
              variant="outline"
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 text-primary dark:text-white  border-primary/40 bg-primary/10 font-semibold rounded-full leading-none tracking-wide"
            >
              beta
            </Badge> */}
            <Badge
              variant="outline"
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 text-primary border-primary/40 bg-primary/10  dark:text-violet-400  dark:border-violet-500/30 dark:bg-violet-500/10 font-semibold rounded-full leading-none tracking-wide"
            >
              beta
            </Badge>
          </Link>

          {/* Search - Hidden on very small screens, grows on larger screens */}
          {/* <div className="flex-1 max-w-xl mx-2 sm:mx-3 md:mx-4">
            <Search />
          </div> */}
          <NewSearch />

          {/* Action buttons - Responsive spacing and sizing */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Auth Button - Hidden on smallest screens, shown in SideNav */}
            <AuthButton />

            {/* Quick Access - Compact on mobile */}
            <QuickAccessNavigation />

            {/* Side Navigation */}
            <SideNav />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
