import Link from "next/link";
import { getSurahLevel, juz30Surahs } from "@/lib/juz30";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f0dd] text-[#14342b]">
      <section className="relative overflow-hidden bg-[#0f5f4a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_25%,rgba(255,213,111,0.35),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(126,219,191,0.28),transparent_22%),linear-gradient(135deg,#0f5f4a,#0b3d4d)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffd56f] sm:text-sm sm:tracking-[0.26em]">
              Hafalan Jadi Petualangan
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              Juz 30 Quest
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-white/85 sm:text-base md:text-lg md:leading-8">
              Pilih surat, susun ayat yang diacak, kejar skor terbaik, dan
              lanjutkan progres dari browser yang sama.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
              <span className="rounded-full bg-white px-4 py-2 text-[#0f5f4a]">
                Tanpa Login
              </span>
              <span className="rounded-full bg-[#ffd56f] px-4 py-2 text-[#2d250d]">
                Timer & Skor
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                Data Statis
              </span>
            </div>
          </div>

          <div className="relative min-h-48 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:min-h-56 sm:rounded-[2rem] sm:p-6">
            <div className="absolute bottom-6 left-5 right-5 grid grid-cols-3 gap-2 sm:bottom-7 sm:left-7 sm:right-7 sm:gap-3">
              {["78", "93", "100", "108", "112", "114"].map((item) => (
                <div
                  key={item}
                  className="flex aspect-square items-center justify-center rounded-2xl bg-white text-lg font-black text-[#0f5f4a] shadow-lg sm:text-xl md:text-2xl"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0f7c68]">
              Pilih Surat
            </p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Daftar Juz 30</h2>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#526057] shadow-sm">
            {juz30Surahs.length} surat tersedia
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {juz30Surahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="group rounded-2xl border border-[#dccb91] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0f7c68] hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0f5f4a] text-sm font-black text-white">
                    {surah.id}
                  </span>
                  <h3 className="mt-4 text-xl font-black sm:text-2xl">
                    {surah.transliteration}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-[#637167]">
                    {surah.translation}
                  </p>
                </div>
                <p dir="rtl" className="text-2xl font-black text-[#0f7c68] sm:text-3xl">
                  {surah.name}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 text-sm font-black">
                <span className="rounded-full bg-[#f7f1df] px-3 py-2 text-[#675a30]">
                  {surah.total_verses} ayat
                </span>
                <span className="rounded-full bg-[#d9f3dc] px-3 py-2 text-[#17603f]">
                  {getSurahLevel(surah.total_verses)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
