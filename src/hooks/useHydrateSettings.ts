"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { hydrateAudio } from "@/lib/store/slices/audio-slice";
import { hydrateFont } from "@/lib/store/slices/font-slice";
import { hydrateSurah } from "@/lib/store/slices/surah-slice";
import { hydrateWishlist } from "@/lib/store/slices/wishlist-slice";
import { hydrateAthkar } from "@/lib/store/slices/athkar-slice";
import { hydrateLanguage } from "@/lib/store/slices/language-slice";
import { setSyncStatus } from "@/lib/store/slices/sync-slice";
import type { LastRead } from "@/types/surah";
import {
  SettingsResponse,  
} from "@/types/settings";


export function useHydrateSettings() {
  const { user, isAuthenticated } = useAppSelector((state) => state.sync);
  const dispatch = useAppDispatch();
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Only hydrate once when user is authenticated
    if (isAuthenticated && user && !hasHydrated.current) {
      hasHydrated.current = true;

      fetch("/api/user/settings")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch settings");
          return res.json();
        })
        .then((settings: SettingsResponse) => {
          if (settings) {
            // Hydrate audio state
            dispatch(
              hydrateAudio({
                reciterId: settings.reciterId,
                reciterName: settings.reciterName,
                volume: settings.volume,
                lastPlay: settings.playHistory,
              }),
            );

            // Hydrate font state
            dispatch(
              hydrateFont({
                fontStyle: settings.fontStyle,
                fontSize: settings.fontSize,
                ayahNumberStyle: settings.ayahNumberStyle,
              }),
            );

            // Hydrate surah state (reconstruct from flattened fields)
            if (settings.lastRead) {
              dispatch(
                hydrateSurah({ lastRead: settings.lastRead as LastRead }),
              );
            }

            // Hydrate language state
            if (settings.language) {
              dispatch(
                hydrateLanguage({ language: settings.language as "ar" | "en" })
              );
            }

            // Hydrate wishlist state (transform from DB format)
            dispatch(
              hydrateWishlist({
                wishlistReciters: settings.wishlistReciters
                  ? settings.wishlistReciters
                  : undefined,
                wishlistSurahs: settings.wishlistSurahs
                  ? settings.wishlistSurahs
                  : undefined,
              }),
            );

            // Hydrate athkar state
            if (settings.athkarData && settings.athkarExpiration) {
              dispatch(
                hydrateAthkar({
                  athkarData: settings.athkarData as Parameters<
                    typeof hydrateAthkar
                  >[0]["athkarData"],
                  athkarExpiration: settings.athkarExpiration,
                }),
              );
            }

            // Mark as synced after successful hydration
            dispatch(setSyncStatus("synced"));
          }
        })
        .catch((error) => {
          console.warn("Could not load settings from database:", error);
        });
    }

    // Reset hydration flag when user logs out
    if (!isAuthenticated) {
      hasHydrated.current = false;
    }
  }, [isAuthenticated, user, dispatch]);
}
