import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/lib/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CompletedKhatmas = () => {
  const t = useTranslations("Khatma");
  const completedKhatmas = useAppSelector(
    (state) => state.sync.user?.completedKhatmas ?? 0,
  );

  return (
    <Card className="group relative mx-auto w-full overflow-hidden border-primary/10 bg-background/50 shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-primary/20 hover:bg-background/80 hover:shadow-md dark:bg-card/40 dark:hover:bg-card/60">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px] transition-transform duration-700 group-hover:scale-110" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px] transition-transform duration-700 group-hover:scale-110" />

      <CardHeader className="relative z-10 flex flex-col items-center space-y-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/20 transition-transform duration-500 group-hover:scale-105">
          <Sparkles className="h-10 w-10" strokeWidth={1.5} />
        </div>

        <CardTitle className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-[15px] font-bold uppercase tracking-widest text-primary transition-colors group-hover:bg-primary/10">
          {t("completedKhatmasLabel")}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col items-center justify-center pb-8 text-center">
        <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-7xl font-bold tracking-tighter text-transparent sm:text-8xl">
          {completedKhatmas}
        </span>

        <div className="mt-3 flex items-center gap-3">
          <span className="h-px w-6 rounded-full bg-border transition-all duration-500 group-hover:w-10 group-hover:bg-primary/40" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t("lifetimeTotal")}
          </span>
          <span className="h-px w-6 rounded-full bg-border transition-all duration-500 group-hover:w-10 group-hover:bg-primary/40" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedKhatmas;
