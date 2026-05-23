"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Gamepad2, Headphones, Square, Volume2 } from "lucide-react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    audio.src = getVerseAudioUrl(surah.id, verse.id, selectedReciter);
    audio.onended = () => setPlayingVerseId(null);
    audio.onerror = () => setPlayingVerseId(null);
    setPlayingVerseId(verse.id);
    void audio.play().catch(() => setPlayingVerseId(null));
  }

  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b5148]/95 text-white shadow-lg shadow-black/10 backdrop-blur">
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
          {surah.verses.map((verse) => {
            const isPlaying = playingVerseId === verse.id;

            return (
              <article
                key={verse.id}
                className="rounded-3xl border border-[#dccb91] bg-white p-4 shadow-sm dark:border-[#376b60] dark:bg-[#102423] sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0f5f4a] text-sm font-black text-white dark:bg-[#ffd56f] dark:text-[#102423]">
                    {verse.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => playVerseAudio(verse)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f5f4a] px-4 py-2 text-xs font-black text-white transition hover:scale-105 dark:bg-[#ffd56f] dark:text-[#102423]"
                  >
                    {isPlaying ? (
                      <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                    ) : (
                      <Volume2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isPlaying ? "Stop" : "Dengar"}
                  </button>
                </div>
                <p
                  dir="rtl"
                  style={getReaderArabicStyle(verse.text)}
                  className="text-right font-normal text-[#142820] dark:text-[#f2fbf7]"
                >
                  {verse.text}
                </p>
                {verse.translation ? (
                  <p className="mt-4 rounded-2xl bg-[#f7f1df] px-4 py-3 text-sm font-semibold leading-6 text-[#526057] dark:bg-[#1b3734] dark:text-[#d9efe5]">
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
