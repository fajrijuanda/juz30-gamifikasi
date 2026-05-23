"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { getCurrentThemeMode, setThemeMode, type ThemeMode } from "@/components/ThemeProvider";

const modes: ThemeMode[] = ["light", "dark", "system"];

const labels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getCurrentThemeMode());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      setMode((event as CustomEvent<ThemeMode>).detail);
    };

    window.addEventListener("juz30-theme-change", onThemeChange);
    return () => window.removeEventListener("juz30-theme-change", onThemeChange);
  }, []);

  const CurrentIcon = icons[mode];

  return (
    <div className="relative text-[11px] font-black text-white">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/14 px-4 py-2 ring-1 ring-white/20 transition hover:bg-white/20"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {labels[mode]}
        <ChevronDown className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-36 overflow-hidden rounded-2xl bg-[#0b5148]/95 p-1.5 shadow-xl shadow-black/20 ring-1 ring-white/15 backdrop-blur dark:bg-[#071b1c]/95">
          {modes.map((item) => {
            const Icon = icons[item];

            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setThemeMode(item);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                  mode === item
                    ? "bg-white text-[#0f5f4a] shadow-sm dark:bg-[#ffd56f] dark:text-[#112f28]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                aria-pressed={mode === item}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {labels[item]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
