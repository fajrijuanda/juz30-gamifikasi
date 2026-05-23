"use client";

import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

export function AppLoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(false), 950);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-[#0b5148] text-white">
      <div className="absolute inset-0 star-field" />
      <div className="relative flex -translate-y-16 flex-col items-center gap-5 px-6 text-center sm:-translate-y-20 lg:-translate-y-28">
        <div className="relative grid h-24 w-24 place-items-center rounded-[2rem] bg-[#ffd56f] text-[#0f3f37] shadow-2xl shadow-black/30">
          <Sparkles className="absolute -right-2 -top-2 h-8 w-8 animate-pulse text-white" />
          <BookOpen className="h-12 w-12 animate-[book-breathe_1.4s_ease-in-out_infinite]" />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd56f]">
            Memulai Misi
          </p>
          <h2 className="mt-2 text-3xl font-black">Juz 30 Quest</h2>
        </div>

        <div className="flex gap-2">
          <span className="h-3 w-3 animate-[dot-bounce_0.9s_ease-in-out_infinite] rounded-full bg-white" />
          <span className="h-3 w-3 animate-[dot-bounce_0.9s_ease-in-out_0.15s_infinite] rounded-full bg-[#ffd56f]" />
          <span className="h-3 w-3 animate-[dot-bounce_0.9s_ease-in-out_0.3s_infinite] rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}
