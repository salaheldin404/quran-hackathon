"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { resetToDefaultState } from "@/lib/store/root-actions";
import { cancelPendingSave } from "@/lib/store/store";
import { useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { UserRound } from "lucide-react";

const AuthButton = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.sync);
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const t = useTranslations("AuthButton");

  const handleLogout = useCallback(async () => {
    cancelPendingSave();
    localStorage.removeItem("userSettings");
    dispatch(resetToDefaultState());
    
    window.location.href = "/api/auth/logout";
  }, [dispatch]);

  if (isAuthenticated && user) {
    const displayName = user.firstName || user.email || "User";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full
                       hover:ring-2 hover:ring-primary/20
                       transition-all duration-200
                       focus-visible:ring-2 focus-visible:ring-primary
                       active:scale-95"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8 border-2 border-transparent hover:border-primary/20 transition-colors">
              <AvatarImage src={""} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {displayName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2">
          <DropdownMenuItem asChild dir={locale === "ar" ? "rtl" : "ltr"}>
            <Link
              href="/profile"
              className="cursor-pointer min-h-[25px] rounded-md"
            >
              <UserRound className="h-4 w-4" />
              {t("profile")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer min-h-[25px] rounded-md
                       focus:bg-destructive/10 focus:text-destructive
                       transition-colors"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {t("sign-out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link href="/auth/signin" className="w-full min-[500px]:w-auto">
      <Button
        variant="outline"
        className="cursor-pointer w-full min-[500px]:w-auto
                   min-h-[36px] px-4
                   hover:bg-primary/5 hover:border-primary/50
                   active:scale-95
                   transition-all duration-200
                   focus-visible:ring-2 focus-visible:ring-primary
                   text-sm font-medium"
        size="sm"
      >
        {t("sign-in")}
      </Button>
    </Link>
  );
};

export default AuthButton;
