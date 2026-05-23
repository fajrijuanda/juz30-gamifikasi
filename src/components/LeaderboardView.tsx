"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { showAppLoading } from "@/components/AppLoadingScreen";
import { ThemeToggle } from "@/components/ThemeToggle";
import { juz30Surahs } from "@/lib/juz30";

type LeaderboardProgress = {
  bestScore: number;
  completed: boolean;
};

type LeaderboardEntry = {
  surahId: number;
  surahName: string;
  surahArabic: string;
  translation: string;
  totalVerses: number;
  bestScore: number;
  completed: boolean;
};

function subscribeToLocalStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getLeaderboardSnapshot() {
  if (typeof window === "undefined") return "[]";

  return JSON.stringify(
    juz30Surahs.map((surah) => {
      const raw = window.localStorage.getItem(`diniyyah-progress-${surah.id}`);
      let progress: LeaderboardProgress = {
        bestScore: 0,
        completed: false,
      };

      if (raw) {
        try {
          progress = JSON.parse(raw) as LeaderboardProgress;
        } catch {
          progress = {
            bestScore: 0,
            completed: false,
          };
        }
      }

      return {
        surahId: surah.id,
        surahName: surah.transliteration,
        surahArabic: surah.name,
        translation: surah.translation,
        totalVerses: surah.total_verses,
        bestScore: progress.bestScore,
        completed: progress.completed,
      };
    }),
  );
}

function getServerSnapshot() {
  return "[]";
}

function getMedalLabel(index: number) {
  if (index === 0) return "Juara 1";
  if (index === 1) return "Juara 2";
  if (index === 2) return "Juara 3";
  return `Peringkat ${index + 1}`;
}

export function LeaderboardView() {
  const snapshot = useSyncExternalStore(
    subscribeToLocalStorage,
    getLeaderboardSnapshot,
    getServerSnapshot,
  );

  const entries = useMemo<LeaderboardEntry[]>(() => {
    const parsed = JSON.parse(snapshot) as LeaderboardEntry[];

    return parsed.sort((a, b) => {
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      if (Number(b.completed) !== Number(a.completed)) {
        return Number(b.completed) - Number(a.completed);
      }
      return a.surahId - b.surahId;
    });
  }, [snapshot]);

  const completedCount = entries.filter((entry) => entry.completed).length;
  const totalScore = entries.reduce((total, entry) => total + entry.bestScore, 0);
  const topEntry = entries.find((entry) => entry.bestScore > 0);

  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b5148]/95 text-white shadow-lg shadow-black/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/" onClick={showAppLoading} className="text-base font-black sm:text-lg">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ffd56f]" aria-hidden="true" />
                Diniyyah Quest
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              onClick={showAppLoading}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0f5f4a] transition hover:bg-[#ffd56f]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="star-field relative overflow-hidden bg-[#0f5f4a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_25%,rgba(255,213,111,0.35),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(126,219,191,0.28),transparent_22%),linear-gradient(135deg,#0f5f4a,#0b3d4d)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#ffd56f] sm:text-sm">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Papan Skor Lokal
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-4xl font-black sm:text-5xl">Leaderboard</h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base">
                Ranking ini memakai skor terbaik yang tersimpan di browser ini.
                Untuk leaderboard antar siswa secara global, nanti perlu login
                dan database seperti Supabase.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black sm:text-sm">
              <div className="rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/15">
                <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-[#ffd56f]" aria-hidden="true" />
                {completedCount}/37
                <span className="mt-1 block text-[10px] text-white/70">Selesai</span>
              </div>
              <div className="rounded-2xl bg-[#ffd56f] px-4 py-3 text-[#173526]">
                <Trophy className="mx-auto mb-1 h-5 w-5" aria-hidden="true" />
                {totalScore}
                <span className="mt-1 block text-[10px] text-[#173526]/70">Total</span>
              </div>
              <div className="rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/15">
                <Medal className="mx-auto mb-1 h-5 w-5 text-[#ffd56f]" aria-hidden="true" />
                {topEntry?.bestScore ?? 0}
                <span className="mt-1 block text-[10px] text-white/70">Terbaik</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#0f7c68] dark:text-[#83e8c7]">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Ranking Surat
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Skor Terbaik Juz 30
            </h2>
          </div>
          <Link
            href="/#daftar-surat"
            onClick={showAppLoading}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#0f5f4a] shadow-sm transition hover:bg-[#ffd56f] dark:bg-[#102e2d] dark:text-[#d9efe5]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Pilih Surat
          </Link>
        </div>

        <div className="grid gap-3">
          {entries.map((entry, index) => {
            const hasScore = entry.bestScore > 0;

            return (
              <Link
                key={entry.surahId}
                href={`/surah/${entry.surahId}`}
                onClick={showAppLoading}
                className={`grid gap-3 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                  hasScore
                    ? "border-[#dccb91] bg-white hover:border-[#0f7c68] dark:border-[#376b60] dark:bg-[#102423]"
                    : "border-[#e3d7ad] bg-white/65 dark:border-[#254942] dark:bg-[#0c2727]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full text-sm font-black ${
                      index < 3 && hasScore
                        ? "bg-[#ffd56f] text-[#2f2610]"
                        : "bg-[#0f5f4a] text-white dark:bg-[#ffd56f] dark:text-[#102423]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f7c68] dark:text-[#83e8c7]">
                      {hasScore ? getMedalLabel(index) : "Belum dimainkan"}
                    </p>
                    <h3 className="mt-1 text-xl font-black">{entry.surahName}</h3>
                    <p className="text-sm font-bold text-[#637167] dark:text-[#adc5b9]">
                      {entry.translation} - {entry.totalVerses} ayat
                    </p>
                  </div>
                </div>

                <p dir="rtl" className="text-right text-3xl font-normal text-[#0f7c68] dark:text-[#7be0bf]">
                  {entry.surahArabic}
                </p>

                <div className="flex items-center justify-between gap-3 sm:min-w-44 sm:flex-col sm:items-end">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${
                      hasScore
                        ? "bg-[#d9f3dc] text-[#17603f] dark:bg-[#174038] dark:text-[#8ce5c6]"
                        : "bg-[#f7f1df] text-[#675a30] dark:bg-[#1b3734] dark:text-[#f3daa0]"
                    }`}
                  >
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                    {entry.bestScore}
                  </span>
                  <span className="text-xs font-black text-[#637167] dark:text-[#adc5b9]">
                    {entry.completed ? "Quest selesai" : "Belum selesai"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
