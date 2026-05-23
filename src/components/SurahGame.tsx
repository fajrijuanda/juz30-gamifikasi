"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
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
import { showAppLoading } from "@/components/AppLoadingScreen";
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

function getArabicTextStyle(text: string, placement: "choice" | "slot"): CSSProperties {
  const length = text.length;

  if (placement === "slot") {
    if (length > 150) {
      return { fontSize: "clamp(1.05rem, 3.4vw, 1.6rem)", lineHeight: 1.85 };
    }

    if (length > 95) {
      return { fontSize: "clamp(1.15rem, 3.8vw, 1.85rem)", lineHeight: 1.8 };
    }

    return { fontSize: "clamp(1.25rem, 4.8vw, 2rem)", lineHeight: 1.75 };
  }

  if (length > 170) {
    return { fontSize: "clamp(0.68rem, 2.2vw, 0.9rem)", lineHeight: 1.45 };
  }

  if (length > 140) {
    return { fontSize: "clamp(0.78rem, 2.5vw, 1.02rem)", lineHeight: 1.5 };
  }

  if (length > 110) {
    return { fontSize: "clamp(0.9rem, 2.9vw, 1.16rem)", lineHeight: 1.58 };
  }

  if (length > 70) {
    return { fontSize: "clamp(1rem, 3.4vw, 1.32rem)", lineHeight: 1.65 };
  }

  return { fontSize: "clamp(1.15rem, 4vw, 1.55rem)", lineHeight: 1.7 };
}

export function SurahGame({ surah }: { surah: Surah }) {
  const [choices, setChoices] = useState<Verse[]>([]);
  const [placed, setPlaced] = useState<PlacedVerse[]>([]);
  const [selected, setSelected] = useState<Verse | null>(null);
  const [draggingVerseId, setDraggingVerseId] = useState<number | null>(null);
  const [isPickerPanning, setIsPickerPanning] = useState(false);
  const [isPickerExpanded, setIsPickerExpanded] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
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
  const headerRef = useRef<HTMLElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef({
    pointerId: -1,
    startY: 0,
    scrollTop: 0,
  });
  const sheetDragRef = useRef({
    pointerId: -1,
    startY: 0,
  });

  const score = useMemo(() => {
    const correct = placed.filter(Boolean).length;
    return calculateScore({ correct, streak, mistakes, seconds });
  }, [mistakes, placed, seconds, streak]);

  const isComplete = placed.length > 0 && placed.every(Boolean);
  const isGameOver = isComplete || isFinished;

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderOffset = () => {
      document.documentElement.style.setProperty(
        "--quest-header-height",
        `${header.offsetHeight}px`,
      );
    };

    updateHeaderOffset();

    const observer = new ResizeObserver(updateHeaderOffset);
    observer.observe(header);
    window.addEventListener("resize", updateHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderOffset);
      document.documentElement.style.removeProperty("--quest-header-height");
    };
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    setChoices(shuffle(surah.verses));
    setPlaced(Array.from({ length: surah.verses.length }, () => null));
    setSlotFeedback(Array.from({ length: surah.verses.length }, () => null));
  }, [surah.verses]);

  useEffect(() => {
    if (!isRunning || isGameOver) return;

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isGameOver, isRunning]);

  function saveProgress(finalScore: number) {
    const nextProgress = {
      completed: true,
      bestScore: Math.max(progress.bestScore, finalScore),
    };

    setProgress(nextProgress);
    window.localStorage.setItem(
      `juz30-progress-${surah.id}`,
      JSON.stringify(nextProgress),
    );
  }

  function restart() {
    setChoices(shuffle(surah.verses));
    setPlaced(Array.from({ length: surah.verses.length }, () => null));
    setSlotFeedback(Array.from({ length: surah.verses.length }, () => null));
    setSelected(null);
    setDraggingVerseId(null);
    setIsFinished(false);
    setIsGameMenuOpen(false);
    setSeconds(0);
    setMistakes(0);
    setStreak(0);
    setIsRunning(true);
  }

  function pickVerse(verse: Verse) {
    if (!isRunning || isGameOver) return;
    setSelected(verse);
  }

  function resolveVerse(verseId: number | null) {
    if (verseId === null) return null;
    return choices.find((verse) => verse.id === verseId) ?? null;
  }

  function placeVerse(index: number) {
    if (!selected || !isRunning || isGameOver || placed[index]) return;

    submitVerseToSlot(index, selected);
  }

  function submitVerseToSlot(index: number, submittedVerse: Verse) {
    if (!isRunning || isGameOver || placed[index]) return;

    const targetVerse = surah.verses[index];

    if (submittedVerse.id === targetVerse.id) {
      const nextStreak = streak + 1;
      const nextCorrect = placed.filter(Boolean).length + 1;
      const isFinishing = nextCorrect === surah.verses.length;

      setPlaced((current) => {
        const next = [...current];
        next[index] = submittedVerse;
        return next;
      });
      setSlotFeedback((current) => {
        const next = [...current];
        next[index] = "correct";
        return next;
      });
      setChoices((current) =>
        current.filter((verse) => verse.id !== submittedVerse.id),
      );
      setSelected(null);
      setDraggingVerseId(null);
      setStreak(nextStreak);

      if (isFinishing) {
        const finalScore = calculateScore({
          correct: nextCorrect,
          streak: nextStreak,
          mistakes,
          seconds,
        });
        setIsRunning(false);
        saveProgress(finalScore);
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

  function openGameMenu() {
    setIsRunning(false);
    setIsGameMenuOpen(true);
  }

  function continueGame() {
    if (!isGameOver) {
      setIsRunning(true);
    }
    setIsGameMenuOpen(false);
  }

  function finishGame() {
    setIsRunning(false);
    setIsFinished(true);
    saveProgress(score);
  }

  return (
    <main className="min-h-screen bg-[#f6f0dd] pt-[var(--quest-header-height,18.5rem)] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <section
        ref={headerRef}
        className="star-field fixed inset-x-0 top-0 z-40 overflow-visible border-b border-[#d9c98d] bg-[#0f5f4a] text-white shadow-lg shadow-black/10 dark:border-[#23574e]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,213,111,0.34),transparent_28%),linear-gradient(135deg,rgba(18,132,104,0.95),rgba(10,66,75,0.95))]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8 lg:py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 lg:flex-nowrap">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                onClick={showAppLoading}
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

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="lg:min-w-72">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffd56f] sm:text-sm sm:tracking-[0.22em]">
                Susun Ayat Juz 30
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl md:text-5xl lg:text-3xl">
                {surah.transliteration}
              </h1>
              <p className="mt-2 text-sm text-white/85 sm:text-base md:text-lg lg:text-sm">
                {surah.translation} - {surah.total_verses} ayat
              </p>
            </div>

            <div className="hidden lg:block" />

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setIsMissionOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-black text-white ring-1 ring-white/20 transition hover:scale-105 hover:bg-white/20 sm:px-5"
              >
                <Sparkles className="h-4 w-4 text-[#ffd56f]" aria-hidden="true" />
                Misi
              </button>
              <button
                type="button"
                onClick={openGameMenu}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-[#0f5f4a] shadow-lg shadow-black/15 transition hover:scale-105 sm:px-5"
              >
                <Pause className="h-4 w-4" aria-hidden="true" />
                Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-8 sm:py-6 md:gap-6 ${
          isPickerExpanded
            ? "pb-[calc(62svh+1.5rem)] lg:pb-[calc(54vh+1.5rem)]"
            : "pb-[calc(22svh+1.5rem)] lg:pb-[calc(24vh+1.5rem)]"
        }`}
      >
        <div className="grid gap-3">
          {surah.verses.map((verse, index) => {
            const current = placed[index];

            return (
              <button
                key={verse.id}
                type="button"
                onClick={() => placeVerse(index)}
                onDragOver={(event) => {
                  if (placed[index]) return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const verseId = Number(event.dataTransfer.getData("text/plain"));
                  const verse = resolveVerse(Number.isNaN(verseId) ? draggingVerseId : verseId);
                  if (!verse) return;
                  submitVerseToSlot(index, verse);
                }}
                disabled={Boolean(current)}
                className={`min-h-20 rounded-2xl border-2 p-3 text-left shadow-sm transition sm:min-h-24 sm:p-4 ${
                  slotFeedback[index] === "correct"
                    ? "border-[#18a058] bg-[#e3f7df] ring-2 ring-[#18a058]/25 dark:bg-[#143d33]"
                    : slotFeedback[index] === "wrong"
                      ? "border-[#d64545] bg-[#ffe7e2] ring-2 ring-[#d64545]/25 dark:bg-[#4a1d1d]"
                      : selected || draggingVerseId
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
                    style={current ? getArabicTextStyle(current.text, "slot") : undefined}
                    className="flex-1 text-right text-lg font-bold leading-relaxed text-[#142820] dark:text-[#f2fbf7] sm:text-2xl md:text-[1.65rem]"
                  >
                    {current ? current.text : "Tarik ayat ke sini"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </section>

      {isGameMenuOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-menu-title"
          onClick={() => {
            if (!isGameOver) continueGame();
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#ddcc90] bg-white p-5 text-center shadow-2xl shadow-black/25 dark:border-[#376b60] dark:bg-[#102423]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ffd56f] text-[#102423]">
              {isGameOver ? (
                <Trophy className="h-7 w-7" aria-hidden="true" />
              ) : (
                <Pause className="h-7 w-7" aria-hidden="true" />
              )}
            </div>
            <h2 id="game-menu-title" className="mt-4 text-2xl font-black">
              {isGameOver ? "Quest Selesai" : "Quest Dijeda"}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#637167] dark:text-[#adc5b9]">
              Skor kamu saat ini
            </p>
            <p className="mt-1 text-5xl font-black text-[#0f7c68] dark:text-[#ffd56f]">
              {score}
            </p>

            <div className="mt-6 grid gap-3">
              {!isGameOver ? (
                <button
                  type="button"
                  onClick={continueGame}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f5f4a] px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02]"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Lanjutkan
                </button>
              ) : null}
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd56f] px-5 py-3 text-sm font-black text-[#2f2610] transition hover:scale-[1.02]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Acak Lagi
              </button>
              {!isGameOver ? (
                <button
                  type="button"
                  onClick={finishGame}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#0f5f4a] ring-1 ring-[#0f5f4a]/25 transition hover:scale-[1.02] dark:bg-[#1b3734] dark:text-[#eff8ed] dark:ring-white/10"
                >
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  Selesai
                </button>
              ) : (
                <Link
                  href="/"
                  onClick={showAppLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#0f5f4a] ring-1 ring-[#0f5f4a]/25 transition hover:scale-[1.02] dark:bg-[#1b3734] dark:text-[#eff8ed] dark:ring-white/10"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Ke Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isMissionOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-title"
          onClick={() => setIsMissionOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#ddcc90] bg-white p-5 shadow-2xl shadow-black/25 dark:border-[#376b60] dark:bg-[#102423]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="mission-title" className="inline-flex items-center gap-2 text-lg font-black">
                <Sparkles className="h-5 w-5 text-[#0f7c68] dark:text-[#ffd56f]" aria-hidden="true" />
                Misi Hari Ini
              </h2>
              <button
                type="button"
                onClick={() => setIsMissionOpen(false)}
                className="rounded-full bg-[#f7f1df] px-3 py-2 text-xs font-black text-[#14342b] dark:bg-[#1b3734] dark:text-[#eff8ed]"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 grid gap-3 text-sm font-semibold text-[#37574c] dark:text-[#d9efe5]">
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

            {isGameOver ? (
              <div className="mt-5 rounded-2xl bg-[#e3f7df] p-4 text-center dark:bg-[#143d33]">
                <p className="text-2xl font-black text-[#177245] dark:text-[#8ce5c6]">
                  Selesai!
                </p>
                <p className="mt-1 text-sm font-semibold text-[#315947] dark:text-[#c8e8db]">
                  MasyaAllah, skor kamu tersimpan di browser ini.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <section
        className={`fixed inset-x-0 bottom-0 overflow-hidden border-t border-[#d8c173] bg-[#fffaf0]/95 p-3 shadow-[0_-10px_30px_rgba(36,45,28,0.13)] backdrop-blur transition-[height] duration-300 ease-out dark:border-[#376b60] dark:bg-[#071b1c]/95 sm:p-4 ${
          isPickerExpanded ? "h-[62svh] lg:h-[54vh]" : "h-[22svh] lg:h-[24vh]"
        }`}
      >
        <div className="mx-auto flex h-full max-w-6xl flex-col">
          <div
            className="mb-3 flex cursor-grab flex-col items-center gap-2 active:cursor-grabbing"
            onPointerDown={(event) => {
              sheetDragRef.current = {
                pointerId: event.pointerId,
                startY: event.clientY,
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              if (sheetDragRef.current.pointerId !== event.pointerId) return;

              const deltaY = event.clientY - sheetDragRef.current.startY;
              if (deltaY < -18) setIsPickerExpanded(true);
              if (deltaY > 18) setIsPickerExpanded(false);
            }}
            onPointerCancel={() => {
              sheetDragRef.current.pointerId = -1;
            }}
          >
            <button
              type="button"
              onClick={() => setIsPickerExpanded((current) => !current)}
              className="h-1.5 w-16 rounded-full bg-[#0f7c68]/45 transition hover:bg-[#0f7c68] dark:bg-[#ffd56f]/55 dark:hover:bg-[#ffd56f]"
              aria-label={isPickerExpanded ? "Tutup pilihan ayat" : "Buka pilihan ayat"}
            />
            <div className="flex w-full items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-black text-[#14342b] dark:text-[#eff8ed]">
                <Headphones className="h-4 w-4" aria-hidden="true" />
                Pilihan Ayat {selected ? "- Ayat dipilih" : ""}
              </p>
              <p className="hidden text-xs font-bold text-[#6c7055] dark:text-[#a6c3b7] sm:block">
                {isPickerExpanded
                  ? "Tarik handle ke bawah untuk menutup"
                  : "Tarik handle ke atas untuk membuka"}
              </p>
            </div>
          </div>
          <div
            ref={pickerRef}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;

              const target = event.target as HTMLElement;
              if (target.closest("[data-no-pan]")) return;

              const picker = pickerRef.current;
              if (!picker) return;

              panRef.current = {
                pointerId: event.pointerId,
                startY: event.clientY,
                scrollTop: picker.scrollTop,
              };
              setIsPickerPanning(true);
              picker.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!isPickerPanning || panRef.current.pointerId !== event.pointerId) {
                return;
              }

              const picker = pickerRef.current;
              if (!picker) return;
              picker.scrollTop = panRef.current.scrollTop - (event.clientY - panRef.current.startY);
            }}
            onPointerUp={(event) => {
              if (panRef.current.pointerId !== event.pointerId) return;
              setIsPickerPanning(false);
            }}
            onPointerCancel={() => setIsPickerPanning(false)}
            className={`juz-scrollbar grid flex-1 gap-3 overflow-y-auto overscroll-contain pr-2 md:grid-cols-2 ${
              isPickerPanning ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
          >
            {choices.map((verse) => (
              <div
                key={verse.id}
                className={`flex h-36 flex-col justify-between gap-3 overflow-hidden rounded-2xl border p-3 text-right shadow-sm transition hover:-translate-y-1 sm:h-40 sm:p-4 md:h-44 ${
                  selected?.id === verse.id
                    ? "border-[#0f5f4a] bg-[#d9f3dc] dark:bg-[#143d33]"
                    : "border-[#dccb91] bg-white dark:border-[#376b60] dark:bg-[#102423]"
                }`}
              >
                <span className="shrink-0 text-left">
                  <button
                    data-no-pan
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
                  data-no-pan
                  onClick={() => pickVerse(verse)}
                  draggable={isRunning && !isGameOver}
                  onDragStart={(event) => {
                    setDraggingVerseId(verse.id);
                    setSelected(verse);
                    event.dataTransfer.setData("text/plain", verse.id.toString());
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggingVerseId(null)}
                  dir="rtl"
                  style={getArabicTextStyle(verse.text, "choice")}
                  className="block min-h-0 flex-1 touch-none select-none overflow-hidden text-right font-bold text-[#1d2f28] dark:text-[#f2fbf7]"
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
