"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type LandingTab = "accident" | "business";

const DEFAULT_TAB: LandingTab = "business";
const TAB_STORAGE_KEY = "claim-intake:landing-tab";

function isTab(value: string | null): value is LandingTab {
  return value === "accident" || value === "business";
}

interface LandingTabContextValue {
  tab: LandingTab;
  chooseTab: (next: LandingTab) => void;
}

const LandingTabContext = createContext<LandingTabContextValue | null>(null);

// Holds the selected tab so the hero and the sections below it always agree.
export default function LandingTabProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<LandingTab>(DEFAULT_TAB);

  // The tab choice is read from the URL (?tab=) first, then from the last
  // choice in this browser session. It is read here, after mount, instead
  // of with useSearchParams, which would force the whole page to render
  // on the client only.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      if (isTab(fromUrl)) {
        setTab(fromUrl);
        return;
      }
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (isTab(saved)) setTab(saved);
    } catch {
      // storage or URL access unavailable: keep the default tab
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function chooseTab(next: LandingTab) {
    setTab(next);
    try {
      sessionStorage.setItem(TAB_STORAGE_KEY, next);
    } catch {
      // the choice just won't be remembered
    }
  }

  return <LandingTabContext.Provider value={{ tab, chooseTab }}>{children}</LandingTabContext.Provider>;
}

export function useLandingTab() {
  const ctx = useContext(LandingTabContext);
  if (!ctx) throw new Error("useLandingTab must be used inside LandingTabProvider");
  return ctx;
}
