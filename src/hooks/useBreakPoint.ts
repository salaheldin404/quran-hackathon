
"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

type BreakpointState = {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMounted: boolean;
};

export const useBreakpoint = () => {
  const [state, setState] = useState<BreakpointState>({
    width: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isMounted: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      setState({
        width,

        isMobile: width < MOBILE_BREAKPOINT,

        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,

        isDesktop: width >= TABLET_BREAKPOINT,

        isMounted: true,
      });
    };

    updateBreakpoint();

    window.addEventListener("resize", updateBreakpoint);

    return () => {
      window.removeEventListener("resize", updateBreakpoint);
    };
  }, []);

  return state;
};
