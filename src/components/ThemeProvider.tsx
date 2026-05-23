"use client";

import { useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

const storageKey = "juz30-theme";

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";

  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = mode;
  root.dataset.resolvedTheme = resolved;
}

export function setThemeMode(mode: ThemeMode) {
  window.localStorage.setItem(storageKey, mode);
  applyTheme(mode);
  window.dispatchEvent(new CustomEvent<ThemeMode>("juz30-theme-change", { detail: mode }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => applyTheme(getStoredTheme());

    syncSystemTheme();
    media.addEventListener("change", syncSystemTheme);

    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  return children;
}

export function getCurrentThemeMode() {
  return getStoredTheme();
}
