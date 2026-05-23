"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  Headphones,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";
import { showAppLoading } from "@/components/AppLoadingScreen";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VoiceSettings } from "@/components/VoiceSettings";
import {
  audioReciters,
  defaultReciterId,
  getVerseAudioUrl,
  reciterStorageKey,
  type AudioReciterId,
  type Surah,
  type Verse,
} from "@/lib/juz30";

function isAudioReciterId(value: string | null): value is AudioReciterId {
  return audioReciters.some((reciter) => reciter.id === value);
}

function getReaderArabicStyle(text: string) {
  if (text.length > 150) {
    return { fontSize: "clamp(1.25rem, 4vw, 2rem)", lineHeight: 2 };
  }

  if (text.length > 95) {
    return { fontSize: "clamp(1.45rem, 4.8vw, 2.35rem)", lineHeight: 1.95 };
  }

  return { fontSize: "clamp(1.7rem, 6vw, 2.75rem)", lineHeight: 1.9 };
}

export function SurahReader({ surah }: { surah: Surah }) {
  const [selectedReciter, setSelectedReciter] = useState<AudioReciterId>(() => {
    if (typeof window === "undefined") return defaultReciterId;

    const saved = window.localStorage.getItem(reciterStorageKey);
    return isAudioReciterId(saved) ? saved : defaultReciterId;
  });
  const [playingVerseId, setPlayingVerseId] = useState<number | null>(null);
  const [autoPlayIndex, setAutoPlayIndex] = useState(-1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<(HTMLElement | null)[]>([]);
  const selectedReciterRef = useRef(selectedReciter);
  selectedReciterRef.current = selectedReciter;

  const isAutoMode = autoPlayIndex >= 0;

  // Sync reciter selection across tabs / settings modal
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== reciterStorageKey) return;
      if (isAudioReciterId(event.newValue)) {
        setSelectedReciter(event.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Stop audio on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
      }
    };
  }, []);

  // Auto-play: load + play the verse at autoPlayIndex whenever it changes
  useEffect(() => {
    if (autoPlayIndex < 0) return;

    const verse = surah.verses[autoPlayIndex];
    if (!verse) {
      setAutoPlayIndex(-1);
      setIsAutoPlaying(false);
      setPlayingVerseId(null);
      return;
    }

    let cancelled = false;
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    audio.pause();
    audio.currentTime = 0;
    audio.src = getVerseAudioUrl(surah.id, verse.id, selectedReciterRef.current);

    audio.onended = () => {
      if (cancelled) return;
      if (autoPlayIndex + 1 < surah.verses.length) {
        setAutoPlayIndex(autoPlayIndex + 1);
      } else {
        setAutoPlayIndex(-1);
        setIsAutoPlaying(false);
        setPlayingVerseId(null);
      }
    };

    audio.onerror = () => {
      if (cancelled) return;
      setAutoPlayIndex(-1);
      setIsAutoPlaying(false);
      setPlayingVerseId(null);
    };

    setPlayingVerseId(verse.id);
    void audio.play().catch(() => {
      if (cancelled) return;
      setAutoPlayIndex(-1);
      setIsAutoPlaying(false);
      setPlayingVerseId(null);
    });

    // Scroll the active verse into view
    const el = verseRefs.current[autoPlayIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return () => {
      cancelled = true;
      audio.onended = null;
      audio.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayIndex, surah]);

  // --- Individual verse button (stops auto-play first) ---
  function playVerseAudio(verse: Verse) {
    if (isAutoMode) {
      setAutoPlayIndex(-1);
      setIsAutoPlaying(false);
    }

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
    audio.src = getVerseAudioUrl(surah.id, verse.id, selectedReciter);
    audio.onended = () => setPlayingVerseId(null);
    audio.onerror = () => setPlayingVerseId(null);
    setPlayingVerseId(verse.id);
    void audio.play().catch(() => setPlayingVerseId(null));
  }

  // --- Transport controls ---
  function togglePlayPause() {
    if (!isAutoMode) {
      // Start from the beginning
      setAutoPlayIndex(0);
      setIsAutoPlaying(true);
    } else if (isAutoPlaying) {
      // Pause
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }
      setIsAutoPlaying(false);
    } else {
      // Resume
      const audio = audioRef.current;
      if (audio && audio.paused && audio.src) {
        void audio.play().catch(() => {
          setAutoPlayIndex(-1);
          setIsAutoPlaying(false);
          setPlayingVerseId(null);
        });
      }
      setIsAutoPlaying(true);
    }
  }

  function stopAutoPlay() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
      audio.onerror = null;
    }
    setAutoPlayIndex(-1);
    setIsAutoPlaying(false);
    setPlayingVerseId(null);
  }

  function prevAutoVerse() {
    if (!isAutoMode) return;
    const prevIndex = autoPlayIndex - 1;
    if (prevIndex >= 0) {
      setAutoPlayIndex(prevIndex);
      setIsAutoPlaying(true);
    }
  }

  function nextAutoVerse() {
    if (!isAutoMode) {
      setAutoPlayIndex(0);
      setIsAutoPlaying(true);
      return;
    }
    const nextIndex = autoPlayIndex + 1;
    if (nextIndex < surah.verses.length) {
      setAutoPlayIndex(nextIndex);
      setIsAutoPlaying(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b5148] text-white shadow-lg shadow-black/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link
            href="/"
            onClick={showAppLoading}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-black transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <VoiceSettings />
            <Link
              href={`/surah/${surah.id}`}
              onClick={showAppLoading}
              className="inline-flex items-center gap-2 rounded-full bg-[#ffd56f] px-4 py-2 text-xs font-black text-[#2d250d] transition hover:bg-white"
            >
              <Gamepad2 className="h-4 w-4" aria-hidden="true" />
              Game
            </Link>
          </div>
        </div>

        {/* ── Audio Player Bar ── */}
        <div className="border-t border-white/10 bg-[#094039]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8">
            {/* Transport buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={prevAutoVerse}
                disabled={!isAutoMode || autoPlayIndex <= 0}
                className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent sm:h-10 sm:w-10"
                aria-label="Ayat sebelumnya"
              >
                <SkipBack className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={stopAutoPlay}
                disabled={!isAutoMode}
                className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent sm:h-10 sm:w-10"
                aria-label="Berhenti"
              >
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#ffd56f] text-[#0b3d2e] shadow-lg transition hover:scale-110 hover:bg-white sm:h-12 sm:w-12"
                aria-label={isAutoMode && isAutoPlaying ? "Jeda" : "Putar semua ayat"}
              >
                {isAutoMode && isAutoPlaying ? (
                  <Pause className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Play className="h-5 w-5 translate-x-[1px]" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={nextAutoVerse}
                disabled={isAutoMode && autoPlayIndex >= surah.verses.length - 1}
                className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent sm:h-10 sm:w-10"
                aria-label="Ayat berikutnya"
              >
                <SkipForward className="h-4 w-4 fill-current" aria-hidden="true" />
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 text-xs font-bold sm:text-sm">
              {isAutoMode ? (
                <>
                  <span className="rounded-full bg-white/15 px-3 py-1.5 sm:px-4">
                    Ayat {autoPlayIndex + 1} / {surah.verses.length}
                  </span>
                  {isAutoPlaying ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1ac89b]/20 px-3 py-1.5 text-[#7be0bf]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#1ac89b]" />
                      Memutar
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#ffd56f]/20 px-3 py-1.5 text-[#ffd56f]">
                      Dijeda
                    </span>
                  )}
                </>
              ) : (
                <span className="text-white/60">
                  Tekan ▶ untuk memulai
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="star-field relative overflow-hidden bg-[#0f5f4a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_25%,rgba(255,213,111,0.35),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(126,219,191,0.28),transparent_22%),linear-gradient(135deg,#0f5f4a,#0b3d4d)]" />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-5 py-9 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffd56f] sm:text-sm">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Mode Bacaan
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              {surah.transliteration}
            </h1>
            <p className="mt-2 text-sm font-semibold text-white/85 sm:text-base">
              {surah.translation} - {surah.total_verses} ayat
            </p>
          </div>
          <p
            dir="rtl"
            className="rounded-3xl bg-white/12 px-6 py-4 text-center text-5xl font-normal leading-relaxed text-[#ffd56f] ring-1 ring-white/15"
          >
            {surah.name}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#0f7c68] dark:text-[#83e8c7]">
              <Headphones className="h-4 w-4" aria-hidden="true" />
              Baca Berurutan
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Ayat Surat {surah.transliteration}
            </h2>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0f5f4a] shadow-sm dark:bg-[#102e2d] dark:text-[#d9efe5]">
            {surah.total_verses} ayat
          </span>
        </div>

        <div className="grid gap-4">
          {surah.verses.map((verse, index) => {
            const isVerseAudioPlaying = playingVerseId === verse.id;
            const isActiveAutoPlay = isAutoMode && autoPlayIndex === index;

            return (
              <article
                key={verse.id}
                ref={(el) => { verseRefs.current[index] = el; }}
                className={`rounded-3xl border p-4 shadow-sm transition-all duration-300 sm:p-5 ${
                  isActiveAutoPlay
                    ? "border-[#0f7c68] bg-[#e3f7df] ring-2 ring-[#0f7c68]/30 dark:border-[#1ac89b] dark:bg-[#143d33] dark:ring-[#1ac89b]/25"
                    : "border-[#dccb91] bg-white dark:border-[#376b60] dark:bg-[#102423]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black transition-colors ${
                      isActiveAutoPlay
                        ? "bg-[#0f7c68] text-white dark:bg-[#1ac89b] dark:text-[#071b1c]"
                        : "bg-[#0f5f4a] text-white dark:bg-[#ffd56f] dark:text-[#102423]"
                    }`}
                  >
                    {isActiveAutoPlay ? (
                      <Volume2 className="h-4 w-4 animate-pulse" aria-hidden="true" />
                    ) : (
                      verse.id
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => playVerseAudio(verse)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition hover:scale-105 ${
                      isVerseAudioPlaying && !isAutoMode
                        ? "bg-[#d64545] text-white"
                        : "bg-[#0f5f4a] text-white dark:bg-[#ffd56f] dark:text-[#102423]"
                    }`}
                  >
                    {isVerseAudioPlaying && !isAutoMode ? (
                      <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isVerseAudioPlaying && !isAutoMode ? "Stop" : "Dengar"}
                  </button>
                </div>
                <p
                  dir="rtl"
                  style={getReaderArabicStyle(verse.text)}
                  className={`text-right font-normal transition-colors ${
                    isActiveAutoPlay
                      ? "text-[#0f5f4a] dark:text-[#7be0bf]"
                      : "text-[#142820] dark:text-[#f2fbf7]"
                  }`}
                >
                  {verse.text}
                </p>
                {verse.translation ? (
                  <p
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-semibold leading-6 transition-colors ${
                      isActiveAutoPlay
                        ? "bg-[#c6edc0] text-[#1a4a30] dark:bg-[#1b4d3a] dark:text-[#c8e8db]"
                        : "bg-[#f7f1df] text-[#526057] dark:bg-[#1b3734] dark:text-[#d9efe5]"
                    }`}
                  >
                    {verse.translation}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
