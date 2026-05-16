"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode, useEffect } from "react";
import { KhatmaPlan } from "@/types/khatma";
import { setKhatmaData } from "./slices/khatma-slice";
import { getKhatmaRange } from "../utils/khatma";
import { setUser } from "./slices/sync-slice";

const StoreProvider = ({
  children,
  initialKhatma,
  user,
}: {
  children: ReactNode;
  initialKhatma: KhatmaPlan | null;
  user: {
    id: string;
    createdAt: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}) => {
  useEffect(() => {
    store.dispatch(setUser(user));
  }, [user]);
  useEffect(() => {
    if (initialKhatma) {
      const range = getKhatmaRange(
        initialKhatma.currentPage,
        initialKhatma.pagesPerDay,
      );
      store.dispatch(
        setKhatmaData({
          bookmarkIndex: initialKhatma.bookMarkIndex ?? 0,
          pagesRange: range,
          khatmaId: initialKhatma.id,
          isKhatmaActive: initialKhatma.isActive,
        }),
      );
    }
  }, [initialKhatma]);

  return <Provider store={store}>{children}</Provider>;
};
export default StoreProvider;
