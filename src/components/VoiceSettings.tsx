"use client";

import { useRef, useState } from "react";
import { Check, Mic2, Play, Settings2, Square } from "lucide-react";
import {
  audioReciters,
  defaultReciterId,
  getVerseAudioUrl,
  reciterStorageKey,
  type AudioReciterId,
} from "@/lib/juz30";

function isAudioReciterId(value: string | null): value is AudioReciterId {
  return audioReciters.some((reciter) => reciter.id === value);
}

export function VoiceSettings() {
  const [selectedReciter, setSelectedReciter] = useState<AudioReciterId>(() => {
    if (typeof window === "undefined") return defaultReciterId;

    const saved = window.localStorage.getItem(reciterStorageKey);
    return isAudioReciterId(saved) ? saved : defaultReciterId;
  });
  const [playingReciter, setPlayingReciter] = useState<AudioReciterId | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function saveReciter(reciterId: AudioReciterId) {
    setSelectedReciter(reciterId);
    window.localStorage.setItem(reciterStorageKey, reciterId);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: reciterStorageKey,
        newValue: reciterId,
      }),
    );
  }

  function previewReciter(reciterId: AudioReciterId) {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;

    if (playingReciter === reciterId && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingReciter(null);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = getVerseAudioUrl(78, 1, reciterId);
    audio.onended = () => setPlayingReciter(null);
    audio.onerror = () => setPlayingReciter(null);
    setPlayingReciter(reciterId);
    void audio.play().catch(() => setPlayingReciter(null));
  }

  return (
    <section
      id="pengaturan"
      className="mx-auto max-w-6xl px-5 pt-8 sm:px-8"
    >
      <div className="rounded-2xl border border-[#dccb91] bg-white p-4 shadow-sm dark:border-[#376b60] dark:bg-[#102423] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#0f7c68] dark:text-[#83e8c7]">
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Pengaturan
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              Suara Pembaca Ayat
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f1df] px-4 py-2 text-xs font-black text-[#675a30] dark:bg-[#1b3734] dark:text-[#f3daa0]">
            <Mic2 className="h-4 w-4" aria-hidden="true" />
            {audioReciters.length} pilihan
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audioReciters.map((reciter) => {
            const isSelected = selectedReciter === reciter.id;
            const isPlaying = playingReciter === reciter.id;

            return (
              <div
                key={reciter.id}
                className={`rounded-2xl border p-3 transition ${
                  isSelected
                    ? "border-[#0f7c68] bg-[#e3f7df] ring-2 ring-[#0f7c68]/15 dark:bg-[#143d33]"
                    : "border-[#dccb91] bg-[#fffaf0] dark:border-[#376b60] dark:bg-[#071b1c]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => saveReciter(reciter.id)}
                    className="min-w-0 text-left"
                  >
                    <span className="block text-sm font-black text-[#14342b] dark:text-[#eff8ed]">
                      {reciter.name}
                    </span>
                    <span className="mt-1 block text-xs font-bold text-[#637167] dark:text-[#adc5b9]">
                      {reciter.tone}
                    </span>
                  </button>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                      isSelected
                        ? "bg-[#0f5f4a] text-white dark:bg-[#ffd56f] dark:text-[#102423]"
                        : "bg-white text-[#0f5f4a] dark:bg-[#1b3734] dark:text-[#ffd56f]"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : <Mic2 className="h-4 w-4" />}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => previewReciter(reciter.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f5f4a] px-3 py-2 text-xs font-black text-white transition hover:scale-105 dark:bg-[#ffd56f] dark:text-[#102423]"
                  >
                    {isPlaying ? (
                      <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    )}
                    {isPlaying ? "Stop" : "Preview"}
                  </button>
                  {isSelected ? (
                    <span className="text-xs font-black text-[#0f7c68] dark:text-[#83e8c7]">
                      Aktif
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
