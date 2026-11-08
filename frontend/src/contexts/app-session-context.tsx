"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSelectedPersonId, setSelectedPersonId } from "@/lib/selected-person";

type AppSessionContextValue = {
  personId: string | null;
  personReady: boolean;
  setPersonId: (id: string) => void;
  historyRefreshKey: number;
  bumpHistoryRefresh: () => void;
};

const AppSessionContext = createContext<AppSessionContextValue | null>(null);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [personId, setPersonIdState] = useState<string | null>(null);
  const [personReady, setPersonReady] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    setPersonIdState(getSelectedPersonId());
    setPersonReady(true);
  }, []);

  const setPersonId = useCallback((id: string) => {
    setSelectedPersonId(id);
    setPersonIdState(id);
  }, []);

  const bumpHistoryRefresh = useCallback(() => {
    setHistoryRefreshKey((key) => key + 1);
  }, []);

  const value = useMemo(
    () => ({
      personId,
      personReady,
      setPersonId,
      historyRefreshKey,
      bumpHistoryRefresh,
    }),
    [personId, personReady, setPersonId, historyRefreshKey, bumpHistoryRefresh],
  );

  return (
    <AppSessionContext.Provider value={value}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession(): AppSessionContextValue {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error("useAppSession must be used within AppSessionProvider");
  }
  return context;
}
