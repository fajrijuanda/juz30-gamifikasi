"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Gamepad2, Star, X } from "lucide-react";
import { showAppLoading } from "@/components/AppLoadingScreen";
import type { Surah } from "@/lib/juz30";
import { getSurahLevel } from "@/lib/juz30";

export function SurahChoiceCard({ surah }: { surah: Surah }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group rounded-2xl border border-[#dccb91] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#0f7c68] hover:shadow-xl dark:border-[#376b60] dark:bg-[#102423]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f5f4a] text-sm font-black text-white dark:bg-[#ffd56f] dark:text-[#102423]">
              {surah.id}
            </span>
            <h3 className="mt-4 text-xl font-black sm:text-2xl">
              {surah.transliteration}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#637167] dark:text-[#adc5b9]">
              {surah.translation}
            </p>
          </div>
          <p
            dir="rtl"
            className="text-2xl font-normal text-[#0f7c68] dark:text-[#7be0bf] sm:text-3xl"
          >
            {surah.name}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm font-black">
          <span className="rounded-full bg-[#f7f1df] px-3 py-2 text-[#675a30] dark:bg-[#1b3734] dark:text-[#f3daa0]">
            <BookOpen className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            {surah.total_verses} ayat
          </span>
          <span className="rounded-full bg-[#d9f3dc] px-3 py-2 text-[#17603f] dark:bg-[#174038] dark:text-[#8ce5c6]">
            <Star className="mr-1 inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
            {getSurahLevel(surah.total_verses)}
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`surah-choice-${surah.id}`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[#dccb91] bg-white p-5 text-[#14342b] shadow-2xl shadow-black/25 dark:border-[#376b60] dark:bg-[#102423] dark:text-[#eff8ed]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f7c68] dark:text-[#83e8c7]">
                  Pilih Mode
                </p>
                <h2 id={`surah-choice-${surah.id}`} className="mt-1 text-2xl font-black">
                  {surah.transliteration}
                </h2>
                <p className="mt-1 text-sm font-bold text-[#637167] dark:text-[#adc5b9]">
                  {surah.translation} - {surah.total_verses} ayat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f7f1df] text-[#0f5f4a] transition hover:bg-[#ffd56f] dark:bg-[#1b3734] dark:text-[#eff8ed]"
                aria-label="Tutup pilihan mode surat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p
              dir="rtl"
              className="mt-5 rounded-2xl bg-[#f7f1df] px-4 py-5 text-center text-4xl font-normal leading-relaxed text-[#0f7c68] dark:bg-[#071b1c] dark:text-[#7be0bf]"
            >
              {surah.name}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/baca/${surah.id}`}
                onClick={showAppLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f5f4a] px-5 py-4 text-sm font-black text-white transition hover:scale-[1.02]"
              >
                <BookOpen className="h-5 w-5" aria-hidden="true" />
                Baca Surat
              </Link>
              <Link
                href={`/surah/${surah.id}`}
                onClick={showAppLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffd56f] px-5 py-4 text-sm font-black text-[#2f2610] transition hover:scale-[1.02]"
              >
                <Gamepad2 className="h-5 w-5" aria-hidden="true" />
                Mulai Game
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
