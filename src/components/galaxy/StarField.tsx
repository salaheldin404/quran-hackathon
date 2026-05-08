import { makeStars } from "@/lib/utils/galaxy";
import { useMemo } from "react";
import StarItem from "./StarItem";

export function StarField() {
  const stars = useMemo(() => makeStars(340), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint_style]"
    >
      {/* ── Galactic disk glow ───────────────────────────────────────────── */}
      <div
        className={`
        absolute left-50 top-1/2 w-[88%] h-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full
        pointer-events-none blur-[28px] `}
        style={{
          background:
            "radial-gradient(ellipse,rgba(90,60,160,.09) 0%,rgba(60,40,120,.04) 50%,transparent 75%)",
        }}
      />

      {/* ── Galactic core glow ───────────────────────────────────────────── */}
      <div
        className={`
        absolute left-1/2 top-1/2 w-[28%] h-[17%] -translate-x-1/2 -translate-y-1/2 
        pointer-events-none blur-[16px] `}
        style={{
          background:
            "radial-gradient(ellipse,rgba(255,245,200,.18) 0%,rgba(220,180,120,.08) 40%,transparent 70%)",
        }}
      />

      {/* ── Stars ─────────────────────────────────────────────────────────── */}
      {stars.map((s) => (
        <StarItem key={s.id} star={s} />
      ))}
    </div>
  );
}
