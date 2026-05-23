"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Surah, Verse } from "@/lib/juz30";
import { getVerseAudioUrl } from "@/lib/juz30";

type PlacedVerse = Verse | null;

type Progress = {
  bestScore: number;
  completed: boolean;
};

type SlotFeedback = "correct" | "wrong" | null;

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
  const [slotFeedback, setSlotFeedback] = useState<SlotFeedback[]>([]);
  const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    setSlotFeedback(Array.from({ length: surah.verses.length }, () => null));
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
    setSlotFeedback(Array.from({ length: surah.verses.length }, () => null));
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
      setSlotFeedback((current) => {
        const next = [...current];
        next[index] = "correct";
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

    setSlotFeedback((current) => {
      const next = [...current];
      next[index] = "wrong";
      return next;
    });
    setMistakes((current) => current + 1);
    setStreak(0);

    window.setTimeout(() => {
      setSlotFeedback((current) => {
        if (current[index] !== "wrong") return current;

        const next = [...current];
        next[index] = null;
        return next;
      });
    }, 700);
  }

  function playVerseAudio(verse: Verse) {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    if (playingVerseId === verse.id && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingVerseId(null);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = getVerseAudioUrl(surah.id, verse.id);
    audio.onended = () => setPlayingVerseId(null);
    audio.onerror = () => setPlayingVerseId(null);
    setPlayingVerseId(verse.id);
    void audio.play().catch(() => setPlayingVerseId(null));
  }

  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <section className="star-field relative overflow-hidden border-b border-[#d9c98d] bg-[#0f5f4a] text-white dark:border-[#23574e]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,213,111,0.34),transparent_28%),linear-gradient(135deg,rgba(18,132,104,0.95),rgba(10,66,75,0.95))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Kembali
              </Link>
              <ThemeToggle />
            </div>
            <div className="grid w-full grid-cols-3 gap-2 text-center text-xs font-bold sm:w-auto sm:text-sm">
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2 sm:px-4">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Waktu {formatTime(seconds)}
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#ffd56f] px-3 py-2 text-[#163528] sm:px-4">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Skor {score}
              </span>
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 px-3 py-2 sm:px-4">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#0f5f4a] shadow-lg shadow-black/15 transition hover:scale-105 sm:px-5"
              >
                {isRunning ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                {isRunning ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd56f] px-4 py-3 text-sm font-black text-[#2f2610] shadow-lg shadow-black/15 transition hover:scale-105 sm:px-5"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Acak Lagi
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-5 pb-[calc(34svh+1.5rem)] sm:px-8 sm:py-6 sm:pb-56 md:gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3">
          {surah.verses.map((verse, index) => {
            const current = placed[index];

            return (
              <button
                key={verse.id}
                type="button"
                onClick={() => placeVerse(index)}
                disabled={Boolean(current)}
                className={`min-h-20 rounded-2xl border-2 p-3 text-left shadow-sm transition sm:min-h-24 sm:p-4 ${
                  slotFeedback[index] === "correct"
                    ? "border-[#18a058] bg-[#e3f7df] ring-2 ring-[#18a058]/25 dark:bg-[#143d33]"
                    : slotFeedback[index] === "wrong"
                      ? "border-[#d64545] bg-[#ffe7e2] ring-2 ring-[#d64545]/25 dark:bg-[#4a1d1d]"
                      : selected
                        ? "border-dashed border-[#0f7c68] bg-white/85 hover:bg-white dark:bg-[#142927] dark:hover:bg-[#193632]"
                        : "border-dashed border-[#c6ad59] bg-[#fffaf0] dark:border-[#816f37] dark:bg-[#102423]"
                } ${current ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0f5f4a] text-xs font-black text-white dark:bg-[#ffd56f] dark:text-[#102423] sm:h-10 sm:w-10 sm:text-sm">
                    {current ? "OK" : index + 1}
                  </span>
                  <span
                    dir="rtl"
                    className="flex-1 text-right text-lg font-bold leading-relaxed text-[#142820] dark:text-[#f2fbf7] sm:text-2xl md:text-[1.65rem]"
                  >
                    {current ? current.text : "Pilih ayat dari bawah"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-[#ddcc90] bg-white p-5 shadow-sm dark:border-[#376b60] dark:bg-[#102423]">
          <h2 className="inline-flex items-center gap-2 text-base font-black sm:text-lg">
            <Sparkles className="h-5 w-5 text-[#0f7c68] dark:text-[#ffd56f]" aria-hidden="true" />
            Misi Hari Ini
          </h2>
          <div className="mt-4 grid gap-3 text-sm font-semibold text-[#37574c] dark:text-[#d9efe5]">
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3 dark:bg-[#1b3734]">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Terisi
              </span>
              <span>
                {placed.filter(Boolean).length}/{surah.total_verses}
              </span>
            </div>
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3 dark:bg-[#1b3734]">
              <span className="inline-flex items-center gap-2">
                <Flame className="h-4 w-4" aria-hidden="true" />
                Kombo
              </span>
              <span>{streak}x</span>
            </div>
            <div className="flex justify-between rounded-xl bg-[#f7f1df] p-3 dark:bg-[#1b3734]">
              <span className="inline-flex items-center gap-2">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Salah
              </span>
              <span>{mistakes}</span>
            </div>
          </div>
          {isComplete ? (
            <div className="mt-5 rounded-2xl bg-[#e3f7df] p-4 text-center dark:bg-[#143d33]">
              <p className="text-2xl font-black text-[#177245] dark:text-[#8ce5c6]">
                Selesai!
              </p>
              <p className="mt-1 text-sm font-semibold text-[#315947] dark:text-[#c8e8db]">
                MasyaAllah, skor kamu tersimpan di browser ini.
              </p>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="fixed inset-x-0 bottom-0 h-[34svh] overflow-hidden border-t border-[#d8c173] bg-[#fffaf0]/95 p-3 shadow-[0_-10px_30px_rgba(36,45,28,0.13)] backdrop-blur dark:border-[#376b60] dark:bg-[#071b1c]/95 sm:h-auto sm:max-h-[42svh] sm:p-4">
        <div className="mx-auto flex h-full max-w-6xl flex-col">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-sm font-black text-[#14342b] dark:text-[#eff8ed]">
              <Headphones className="h-4 w-4" aria-hidden="true" />
              Pilihan Ayat {selected ? "- Ayat dipilih" : ""}
            </p>
            <p className="hidden text-xs font-bold text-[#6c7055] dark:text-[#a6c3b7] sm:block">
              Klik pilihan, lalu klik kotak kosong yang sesuai
            </p>
          </div>
          <div className="flex flex-1 gap-3 overflow-x-auto pb-2">
            {choices.map((verse) => (
              <div
                key={verse.id}
                className={`flex h-full min-w-[82vw] flex-col justify-between gap-3 overflow-y-auto rounded-2xl border p-3 text-right shadow-sm transition hover:-translate-y-1 sm:max-h-[30svh] sm:min-w-72 sm:p-4 md:min-w-80 ${
                  selected?.id === verse.id
                    ? "border-[#0f5f4a] bg-[#d9f3dc] dark:bg-[#143d33]"
                    : "border-[#dccb91] bg-white dark:border-[#376b60] dark:bg-[#102423]"
                }`}
              >
                <span className="text-left">
                  <button
                    type="button"
                    onClick={() => {
                      playVerseAudio(verse);
                    }}
                    className="inline-flex rounded-full bg-[#0f5f4a] px-3 py-2 text-[11px] font-black text-white dark:bg-[#ffd56f] dark:text-[#102423]"
                  >
                    <Volume2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    {playingVerseId === verse.id ? "Memutar" : "Dengar"}
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => pickVerse(verse)}
                  dir="rtl"
                  className="block flex-1 text-right text-lg font-bold leading-relaxed text-[#1d2f28] dark:text-[#f2fbf7] sm:text-2xl md:text-[1.55rem]"
                >
                  {verse.text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
