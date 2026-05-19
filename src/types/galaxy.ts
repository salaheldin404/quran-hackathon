import { Surah } from "./surah";

export type Point = { x: number; y: number };

export type BgStar = {
  id: number;
  x: number; // left %
  y: number; // top  %
  size: number; // px
  op: number; // base opacity
  dx: number; // drift amount X (px)
  dy: number; // drift amount Y (px)
  driftDur: number; // drift cycle duration (s)
  twinkleDur: number;
  driftDelay: number;
  twinkleDelay: number;
};

export type Theme = {
  id: string;
  /** Arabic label shown in the UI */
  label: string;
  /** English subtitle */
  subtitle: string;
  color: string;
  surahIds: number[];
};

export interface GalaxySurah extends Surah {
  color: string;
}
export interface GalaxySurahWithPosition extends GalaxySurah {
  position: Point;
}
