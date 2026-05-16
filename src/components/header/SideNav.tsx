"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale, useTranslations } from "next-intl";
import { FaBars, FaPrayingHands } from "react-icons/fa";
import { TbGalaxy } from "react-icons/tb";

import { LuX } from "react-icons/lu";
import { IoHome } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { Link, usePathname } from "@/i18n/navigation";
import { FaRadio } from "react-icons/fa6";
import { GiSoundWaves } from "react-icons/gi";
import { BookOpen, UserRound } from "lucide-react";
import { GiJourney } from "react-icons/gi";

import { useEffect, useState } from "react";

import { ModeToggle } from "./mode-toggle";
import LanguageSwitcher from "./LanguageSwitcher";

const LINKS = [
  {
    title: "home",
    href: "/",
    icon: IoHome,
  },
  {
    title: "profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    title: "journey",
    href: "/journey",
    icon: GiJourney,
  },
  {
    title: "favorites",
    href: "/favorites",
    icon: FaHeart,
  },
  {
    title: "reciters",
    href: "/reciters",
    icon: GiSoundWaves,
  },
  {
    title: "radio",
    href: "/radios",
    icon: FaRadio,
  },
  {
    title: "khatma",
    href: "/khatma",
    icon: BookOpen,
  },

  {
    title: "hisn-muslim",
    href: "/hisn-muslim",
    icon: FaPrayingHands,
  },
  {
    title: "quranic-galaxy",
    href: "/quranicGalaxy",
    icon: TbGalaxy,
  },
];

const SideNav = () => {
  const locale = useLocale();
  const pathname = usePathname();

  const t = useTranslations("SideNav");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="cursor-pointer">
        <button
          type="button"
          aria-label="Open menu"
          className="cursor-pointer rounded-md 
               focus:outline-none focus-visible:ring-2 
               focus-visible:ring-primary"
        >
          <FaBars size={20} aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        className={` pt-7 px-4`}
        side={locale === "en" ? "left" : "right"}
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        {/* Navigation Links */}
        <nav className="flex-1 overflow-auto py-2 hide-scrollbar">
          <ul className="space-y-1">
            {LINKS.map(({ title, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={title} className="w-full">
                  <Link
                    href={href}
                    className={`
                      flex items-center gap-3 py-3 px-4 rounded-lg 
                      transition-all duration-200
                      text-base font-medium
                      min-h-[44px]
                      ${
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-card"
                      }
                      active:scale-[0.98]
                      focus-visible:outline-none focus-visible:ring-2 
                      focus-visible:ring-primary focus-visible:ring-offset-2
                    `}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{t(title)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SheetClose
          asChild
          className={`absolute cursor-pointer top-3 ${
            locale === "en" ? "right-3" : "left-3"
          } text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors`}
        >
          <LuX size={30} />
        </SheetClose>
        <SheetFooter className=" border-t pt-4  space-y-4 ">
          {/* Theme */}
          <ModeToggle />

          {/* Language */}
          <LanguageSwitcher />
          {/* Attribution */}
          <div className="border-t pt-4 mb-2  text-center">
            <Link
              className=" text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              href="https://www.linkedin.com/in/salah-eldin-ahmed-389471221/"
            >
              Built with ❤️ by Salah Eldin
            </Link>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SideNav;
