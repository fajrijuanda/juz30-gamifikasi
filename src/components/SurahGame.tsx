"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Surah, Verse } from "@/lib/juz30";

type PlacedVerse = Verse | null;

type Progress = {
  bestScore: number;
  completed: boolean;
};

const emptyProgress: Progress = {
  bestScore: 0,
  completed: false,
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function calculateScore({
  correct,
  streak,
  mistakes,
  seconds,
}: {
  correct: number;
  streak: number;
  mistakes: number;
  seconds: number;
}) {
  return Math.max(0, correct * 100 + streak * 10 - mistakes * 15 - seconds);
}

export function SurahGame({ surah }: { surah: Surah }) {
  const [choices, setChoices] = useState<Verse[]>([]);
  const [placed, setPlaced] = useState<PlacedVerse[]>([]);
  const [selected, setSelected] = useState<Verse | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<Progress>(() => {
    if (typeof window === "undefined") return emptyProgress;

    const raw = window.localStorage.getItem(`juz30-progress-${surah.id}`);
    return raw ? (JSON.parse(raw) as Progress) : emptyProgress;
  });
  const initialized = useRef(false);

  const score = useMemo(() => {
    const correct = placed.filter(Boolean).length;
    return calculateScore({ correct, streak, mistakes, seconds });
  }, [mistakes, placed, seconds, streak]);

  const isComplete = placed.length > 0 && placed.every(Boolean);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    setChoices(shuffle(surah.verses));
    setPlaced(Array.from({ length: surah.verses.length }, () => null));
  }, [surah.verses]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isComplete, isRunning]);

  function restart() {
    setChoices(shuffle(surah.verses));
    setPlaced(Array.from({ length: surah.verses.length }, () => null));
    setSelected(null);
    setSeconds(0);
    setMistakes(0);
    setStreak(0);
    setIsRunning(true);
  }

  function pickVerse(verse: Verse) {
    if (!isRunning || isComplete) return;
    setSelected(verse);
  }

  function placeVerse(index: number) {
    if (!selected || !isRunning || isComplete || placed[index]) return;

    const targetVerse = surah.verses[index];

    if (selected.id === targetVerse.id) {
      const nextStreak = streak + 1;
      const nextCorrect = placed.filter(Boolean).length + 1;
      const isFinishing = nextCorrect === surah.verses.length;

      setPlaced((current) => {
        const next = [...current];
        next[index] = selected;
        return next;
      });
      setChoices((current) => current.filter((verse) => verse.id !== selected.id));
      setSelected(null);
      setStreak(nextStreak);

      if (isFinishing) {
        const finalScore = calculateScore({
          correct: nextCorrect,
          streak: nextStreak,
          mistakes,
          seconds,
        });
        const nextProgress = {
          completed: true,
          bestScore: Math.max(progress.bestScore, finalScore),
        };

        setIsRunning(false);
        setProgress(nextProgress);
        window.localStorage.setItem(
          `juz30-progress-${surah.id}`,
          JSON.stringify(nextProgress),
        );
      }

      return;
    }

    setMistakes((current) => current + 1);
    setStreak(0);
  }

  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b]">
      <section className="relative overflow-hidden border-b border-[#d9c98d] bg-[#0f5f4a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,213,111,0.34),transparent_28%),linear-gradient(135deg,rgba(18,132,104,0.95),rgba(10,66,75,0.95))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Kembali
            </Link>
            <div className="grid w-full grid-cols-3 gap-2 text-center text-xs font-bold sm:w-auto sm:text-sm">
              <span className="rounded-full bg-white/15 px-3 py-2 sm:px-4">
                Waktu {formatTime(seconds)}
              </span>
              <span className="rounded-full bg-[#ffd56f] px-3 py-2 text-[#163528] sm:px-4">
                Skor {score}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-2 sm:px-4">
                Terbaik {progress.bestScore}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffd56f] sm:text-sm sm:tracking-[0.22em]">
                Susun Ayat Juz 30
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl">
                {surah.transliteration}
              </h1>
              <p className="mt-2 text-sm text-white/85 sm:text-base md:text-lg">
                {surah.translation} - {surah.total_verses} ayat
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setIsRunning((current) => !current)}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-[#0f5f4a] shadow-lg shadow-black/15 transition hover:scale-105 sm:px-5"
              >
                {isRunning ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={restart}
                className="rounded-full bg-[#ffd56f] px-4 py-3 text-sm font-black text-[#2f2610] shadow-lg shadow-black/15 transition hover:scale-105 sm:px-5"
              >
                Acak Lagi
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-5 pb-[calc(32svh+1.5rem)] sm:px-8 sm:py-6 sm:pb-56 md:gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {surah.verses.map((verse, index) => {
            const current = placed[index];

            return (
              <button
                key={verse.id}
                type="button"
                onClick={() => placeVerse(index)}
                className={`min-h-20 rounded-2xl border-2 p-3 text-left shadow-sm transition sm:min-h-24 sm:p-4 ${
                  current
                    ? "border-[#24a06d] bg-white"
                    : selected
                      ? "border-dashed border-[#0f7c68] bg-white/85 hover:bg-white"
                      : "border-dashed border-[#c6ad59] bg-[#fffaf0]"
                }`}
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f5f4a] text-xs font-black text-white sm:h-10 sm:w-10 sm:text-sm">
                    {index + 1}
                  </span>
                  <span
                    dir="rtl"
                    className="flex-1 text-right text-lg font-bold leading-relaxed text-[#142820] sm:text-2xl md:text-[1.65rem]"
                  >
                    {current ? current.text : "Pilih ayat dari bawah"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-[#ddcc90] bg-white p-5 shadow-sm">
          <h2 className="text-base font-black sm:text-lg">Misi Hari Ini</h2>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#37574c]">
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3">
              <span>Terisi</span>
              <span>
                {placed.filter(Boolean).length}/{surah.total_verses}
              </span>
            </div>
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3">
              <span>Kombo</span>
              <span>{streak}x</span>
            </div>
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3">
              <span>Salah</span>
              <span>{mistakes}</span>
            </div>
          </div>
          {isComplete ? (
            <div className="mt-5 rounded-2xl bg-[#e3f7df] p-4 text-center">
              <p className="text-2xl font-black text-[#177245]">Selesai!</p>
              <p className="mt-1 text-sm font-semibold text-[#315947]">
                MasyaAllah, skor kamu tersimpan di browser ini.
              </p>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="fixed inset-x-0 bottom-0 h-[32svh] overflow-hidden border-t border-[#d8c173] bg-[#fffaf0]/95 p-3 shadow-[0_-10px_30px_rgba(36,45,28,0.13)] backdrop-blur sm:h-auto sm:max-h-[42svh] sm:p-4">
        <div className="mx-auto flex h-full max-w-6xl flex-col">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#14342b]">
              Pilihan Ayat {selected ? `- Ayat ${selected.id} dipilih` : ""}
            </p>
            <p className="hidden text-xs font-bold text-[#6c7055] sm:block">
              Klik pilihan, lalu klik kotak kosong yang sesuai
            </p>
          </div>
          <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
            {choices.map((verse) => (
              <button
                key={verse.id}
                type="button"
                onClick={() => pickVerse(verse)}
                className={`h-full min-w-[82vw] overflow-y-auto rounded-2xl border p-3 text-right shadow-sm transition hover:-translate-y-1 sm:max-h-[30svh] sm:min-w-72 sm:p-4 md:min-w-80 ${
                  selected?.id === verse.id
                    ? "border-[#0f5f4a] bg-[#d9f3dc]"
                    : "border-[#dccb91] bg-white"
                }`}
              >
                <span className="mb-2 block text-left text-xs font-black text-[#0f5f4a]">
                  Ayat {verse.id}
                </span>
                <span
                  dir="rtl"
                  className="block text-lg font-bold leading-relaxed text-[#1d2f28] sm:text-2xl md:text-[1.55rem]"
                >
                  {verse.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
