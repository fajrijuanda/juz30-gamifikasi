"use client";

import { useEffect, useState } from "react";
import { getCurrentThemeMode, setThemeMode, type ThemeMode } from "@/components/ThemeProvider";

const modes: ThemeMode[] = ["light", "dark", "system"];

const labels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getCurrentThemeMode());

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      setMode((event as CustomEvent<ThemeMode>).detail);
    };

    window.addEventListener("juz30-theme-change", onThemeChange);
    return () => window.removeEventListener("juz30-theme-change", onThemeChange);
  }, []);

  return (
    <div className="grid grid-cols-3 rounded-full bg-white/12 p-1 text-[11px] font-black text-white ring-1 ring-white/20">
      {modes.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setMode(item);
            setThemeMode(item);
          }}
          className={`rounded-full px-3 py-2 transition ${
            mode === item
              ? "bg-white text-[#0f5f4a] shadow-sm dark:bg-[#ffd56f] dark:text-[#112f28]"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
          aria-pressed={mode === item}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
}
