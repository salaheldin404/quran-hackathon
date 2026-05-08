import { BgStar } from "@/types/galaxy";
import { memo } from "react";

interface StarItemProps {
  star: BgStar;
}
const starBaseClass = `
  absolute
  rounded-full
  bg-white
  will-change-transform
`;
const StarItem = memo(({ star }: StarItemProps) => {
  const style = {
    left: `${star.x}%`,
    top: `${star.y}%`,
    width: star.size,
    height: star.size,
    opacity: star.op,

    transform: `translate3d(${star.dx}px, ${star.dy}px, 0)`,

    boxShadow:
      star.size > 1.5
        ? `0 0 ${star.size * 4}px rgba(255,255,255,.45)`
        : undefined,
  };
  return <div className={starBaseClass} style={style} />;
});

StarItem.displayName = "StarItem";

export default StarItem;
