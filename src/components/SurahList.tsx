"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Surah } from "@/lib/juz30";
import { getSurahLevel } from "@/lib/juz30";
import { SurahChoiceCard } from "./SurahChoiceCard";

export function SurahList({ surahs }: { surahs: Surah[] }) {
  const [filter, setFilter] = useState<"All" | "Mudah" | "Seru" | "Tantangan">("All");

  const visible = surahs.filter((s) => {
    if (filter === "All") return true;
    return getSurahLevel(s.total_verses) === filter;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["All", "Mudah", "Seru", "Tantangan"] as const).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter(label)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
              filter === label
                ? "bg-[#0f7c68] text-white"
                : "bg-white/90 text-[#0f5f4a] dark:bg-[#102e2d] dark:text-[#d9efe5]"
            }`}
          >
            {label === "All" ? <CheckCircle2 className="h-4 w-4" /> : null}
            {label}
          </button>
        ))}
        <span className="ml-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#526057] shadow-sm dark:bg-[#102e2d] dark:text-[#d9efe5]">
          <CheckCircle2 className="h-4 w-4 text-[#0f7c68]" aria-hidden="true" />
          {visible.length} surat
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((surah) => (
          <SurahChoiceCard key={surah.id} surah={surah} />
        ))}
      </div>
    </div>
  );
}
