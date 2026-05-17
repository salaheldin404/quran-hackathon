import { useAddActivityDayMutation } from "@/lib/store/features/activityApi";
import { UserSync } from "@/lib/store/slices/sync-slice";
import {
  calculateReadingTime,
  formatActivityRanges,
} from "@/lib/utils/activity";
import { Verse } from "@/types/verse";
import { useCallback, useEffect, useRef } from "react";

interface UseQuranActivityTrackerOptions {
  user: UserSync | null;
  readingPages: number[];
  groupedVerses: Record<number, Verse[]>;
}

export const useQuranActivityTracker = ({
  user,
  readingPages,
  groupedVerses,
}: UseQuranActivityTrackerOptions) => {
  const [addActivityDay] = useAddActivityDayMutation();
  const pendingActivityTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const trackedPagesRef = useRef<Set<number>>(new Set());
  const activePageRef = useRef<number | null>(null);

  const trackCurrentPage = useCallback(
    (currentIndex: number) => {
      if (!user) return;

      // Cancel any pending timer from the previous page
      if (pendingActivityTimer.current) {
        clearTimeout(pendingActivityTimer.current);
        pendingActivityTimer.current = null;
        if (activePageRef.current !== null) {
          trackedPagesRef.current.delete(activePageRef.current);
        }
      }
      const currentPage = readingPages[currentIndex];
      activePageRef.current = currentPage;

      const versesOnPage = groupedVerses[currentPage] ?? [];
      if (!versesOnPage.length) return;

      if (trackedPagesRef.current.has(currentPage)) return;

      const activityRanges = formatActivityRanges(versesOnPage);
      if (!activityRanges) return;

      const estimatedReadSeconds = calculateReadingTime(versesOnPage);
      console.log('estimatedRead',estimatedReadSeconds)
      trackedPagesRef.current.add(currentPage);
      // Start timer for THIS page — fires after estimated read time
      pendingActivityTimer.current = setTimeout(() => {
        pendingActivityTimer.current = null;
        // Check focus at fire time, not schedule time
        const isWindowFocused =
          typeof document !== "undefined" && document.hasFocus();
        console.log({ isWindowFocused });
        if (typeof document === "undefined" || !document.hasFocus()) return;
        console.log("adding activity for page");
        addActivityDay({
          type: "QURAN",
          seconds: estimatedReadSeconds,
          ranges: [activityRanges],
          mushafId: 4,
        })
          .unwrap()
          .catch((error) => {
            console.error("Failed to save activity:", error);
            trackedPagesRef.current.delete(currentPage); // allow retry on error
          });
      }, estimatedReadSeconds * 1000);
    },
    [user, readingPages, groupedVerses, addActivityDay],
  );

  useEffect(() => {
    return () => {
      if (pendingActivityTimer.current) {
        clearTimeout(pendingActivityTimer.current);
      }
    };
  }, []);

  return { trackCurrentPage };
};
