import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Gamepad2,
  ListChecks,
  Lock,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { showAppLoading } from "@/components/AppLoadingScreen";
import { SurahChoiceCard } from "@/components/SurahChoiceCard";
import { SurahList } from "@/components/SurahList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VoiceSettings } from "@/components/VoiceSettings";
import { juz30Surahs } from "@/lib/juz30";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b] transition-colors dark:bg-[#071b1c] dark:text-[#eff8ed]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b5148]/95 text-white shadow-lg shadow-black/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link href="/" className="text-base font-black sm:text-lg">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ffd56f]" aria-hidden="true" />
              Diniyyah Quest
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <VoiceSettings />
            <Link
              href="/leaderboard"
              onClick={showAppLoading}
              className="inline-flex items-center gap-2 rounded-full bg-[#ffd56f] px-4 py-2 text-xs font-black text-[#2d250d] transition hover:bg-white"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Leaderboard
            </Link>
            <a
              href="#daftar-surat"
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0f5f4a] transition hover:bg-[#ffd56f] sm:inline-flex"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Daftar Surat
            </a>
          </div>
        </div>
      </header>

      <section className="star-field relative overflow-hidden bg-[#0f5f4a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_25%,rgba(255,213,111,0.35),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(126,219,191,0.28),transparent_22%),linear-gradient(135deg,#0f5f4a,#0b3d4d)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:py-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd56f] sm:text-sm sm:tracking-[0.26em]">
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-[#ffd56f]" aria-hidden="true" />
                Hafalan Jadi Petualangan
              </span>
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              Diniyyah Quest
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base md:text-lg md:leading-8">
              Pilih surat, susun ayat yang diacak, kejar skor terbaik, dan
              lanjutkan progres dari browser yang sama.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#0f5f4a]">
                <Lock className="h-4 w-4" aria-hidden="true" />
                Tanpa Login
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ffd56f] px-4 py-2 text-[#2d250d]">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Timer & Skor
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2">
                <Gamepad2 className="h-4 w-4" aria-hidden="true" />
                Data Statis
              </span>
              <Link
                href="/leaderboard"
                onClick={showAppLoading}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white transition hover:bg-white hover:text-[#0f5f4a]"
              >
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-center rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur md:max-w-lg">
            <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] bg-[#f9efd0] p-6 text-[#0f5f4a] shadow-inner shadow-white/40">
              <div className="absolute right-5 top-5 rounded-full bg-[#0f5f4a] px-4 py-2 text-xs font-black text-[#ffd56f] shadow-lg">
                Juz 30
              </div>
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#ffd56f]/45" />
              <div className="absolute -bottom-12 right-2 h-36 w-36 rounded-full bg-[#0f7c68]/15" />

              <div className="relative mx-auto mt-10 grid max-w-sm grid-cols-2 gap-3">
                <div className="rounded-l-[2rem] rounded-r-lg border border-[#d9c98d] bg-white p-5 shadow-xl">
                  <BookOpen className="mb-5 h-9 w-9 text-[#0f7c68]" aria-hidden="true" />
                  <div className="space-y-2">
                    <span className="block h-2 rounded-full bg-[#0f7c68]/25" />
                    <span className="block h-2 w-10/12 rounded-full bg-[#0f7c68]/25" />
                    <span className="block h-2 w-8/12 rounded-full bg-[#0f7c68]/25" />
                  </div>
                  <p className="mt-6 text-sm font-black text-[#0f5f4a]">Quest</p>
                </div>

                <div className="rounded-l-lg rounded-r-[2rem] border border-[#d9c98d] bg-white p-5 text-right shadow-xl">
                  <p dir="rtl" className="text-4xl font-normal leading-relaxed text-[#0f7c68]">
                    جزء عم
                  </p>
                  <div className="mt-5 space-y-2">
                    <span className="ml-auto block h-2 rounded-full bg-[#ffd56f]" />
                    <span className="ml-auto block h-2 w-10/12 rounded-full bg-[#ffd56f]" />
                    <span className="ml-auto block h-2 w-8/12 rounded-full bg-[#ffd56f]" />
                  </div>
                  <p className="mt-6 text-sm font-black text-[#675a30]">37 Surat</p>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-center gap-2 text-sm font-black text-[#0f5f4a]">
                <Sparkles className="h-4 w-4 text-[#f0b429]" aria-hidden="true" />
                Susun ayat, raih bintang
                <Star className="h-4 w-4 fill-[#f0b429] text-[#f0b429]" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="daftar-surat"
        className="mx-auto max-w-6xl scroll-mt-20 px-5 py-8 sm:px-8"
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0f7c68] dark:text-[#83e8c7]">
              <span className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Pilih Surat
              </span>
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Daftar Juz 30</h2>
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#526057] shadow-sm dark:bg-[#102e2d] dark:text-[#d9efe5]">
            <CheckCircle2 className="h-4 w-4 text-[#0f7c68]" aria-hidden="true" />
            {juz30Surahs.length} surat tersedia
          </p>
        </div>

        <SurahList surahs={juz30Surahs} />
      </section>
    </main>
  );
}
