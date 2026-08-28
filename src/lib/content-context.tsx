"use client";

import * as React from "react";
import { SiteData } from "./site-types";
import defaultData from "@/data/site-data.json";

interface ContentContextType {
  data: SiteData;
  setData: React.Dispatch<React.SetStateAction<SiteData>>;
  updateSection: <K extends keyof SiteData>(section: K, value: SiteData[K]) => void;
  saveChanges: (customData?: SiteData) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: number | null;
}

const ContentContext = React.createContext<ContentContextType | null>(null);

const STORAGE_KEY = "portfolio_site_data_cache";

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<SiteData>(defaultData as SiteData);
  const [savedData, setSavedData] = React.useState<SiteData>(defaultData as SiteData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<number | null>(null);

  // Fetch from server / local storage on mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // First check local storage for instant render
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) {
            setData(parsed);
            setSavedData(parsed);
          }
        }
      } catch {
        // ignore storage error
      }

      // Then fetch latest from server API
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (res.ok) {
          const serverData = await res.json();
          if (isMounted && serverData && !serverData.error) {
            setData(serverData);
            setSavedData(serverData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          }
        }
      } catch (err) {
        console.warn("Could not load content from API, using default/cached data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSection = React.useCallback(
    <K extends keyof SiteData>(section: K, value: SiteData[K]) => {
      setData((prev) => ({
        ...prev,
        [section]: value,
      }));
    },
    []
  );

  const saveChanges = React.useCallback(
    async (customData?: SiteData): Promise<boolean> => {
      const dataToSave = customData || data;
      setIsSaving(true);
      try {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSave),
        });

        if (res.ok) {
          setSavedData(dataToSave);
          setLastSaved(Date.now());
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          return true;
        } else {
          console.error("Save failed with status:", res.status);
          return false;
        }
      } catch (err) {
        console.error("Save request error:", err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [data]
  );

  const resetToDefaults = React.useCallback(async () => {
    setData(defaultData as SiteData);
    await saveChanges(defaultData as SiteData);
  }, [saveChanges]);

  const hasUnsavedChanges = React.useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(savedData);
  }, [data, savedData]);

  return (
    <ContentContext.Provider
      value={{
        data,
        setData,
        updateSection,
        saveChanges,
        resetToDefaults,
        isSaving,
        isLoading,
        hasUnsavedChanges,
        lastSaved,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = React.useContext(ContentContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      data: defaultData as SiteData,
      setData: () => {},
      updateSection: () => {},
      saveChanges: async () => false,
      resetToDefaults: async () => {},
      isSaving: false,
      isLoading: false,
      hasUnsavedChanges: false,
      lastSaved: null,
    };
  }
  return context;
}
