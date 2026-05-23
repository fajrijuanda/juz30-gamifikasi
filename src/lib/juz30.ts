import quran from "quran-json/dist/quran_id.json";

export type Verse = {
  id: number;
  text: string;
  translation?: string;
  transliteration?: string;
};

export type Surah = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
  verses: Verse[];
};

export const reciterStorageKey = "diniyyah-reciter";

export const audioReciters = [
  {
    id: "Alafasy_128kbps",
    name: "Mishary Rashid Alafasy",
    tone: "Merdu & familiar",
  },
  {
    id: "Husary_128kbps",
    name: "Mahmoud Khalil Al-Husary",
    tone: "Jelas untuk tahsin",
  },
  {
    id: "Minshawy_Murattal_128kbps",
    name: "Muhammad Siddiq Al-Minshawi",
    tone: "Tenang & tartil",
  },
  {
    id: "Abdul_Basit_Murattal_192kbps",
    name: "Abdul Basit Murattal",
    tone: "Klasik & kuat",
  },
  {
    id: "MaherAlMuaiqly128kbps",
    name: "Maher Al-Muaiqly",
    tone: "Lembut & ringan",
  },
  {
    id: "Abdurrahmaan_As-Sudais_192kbps",
    name: "Abdurrahman As-Sudais",
    tone: "Imam Masjidil Haram",
  },
] as const;

export type AudioReciterId = (typeof audioReciters)[number]["id"];

export const defaultReciterId: AudioReciterId = "Alafasy_128kbps";

const juz30Ids = Array.from({ length: 37 }, (_, index) => index + 78);

export const juz30Surahs = (quran as Surah[])
  .filter((surah) => juz30Ids.includes(surah.id))
  .sort((a, b) => a.id - b.id);

export function getSurah(id: number) {
  return juz30Surahs.find((surah) => surah.id === id);
}

export function getSurahLevel(totalVerses: number) {
  if (totalVerses <= 6) return "Mudah";
  if (totalVerses <= 15) return "Seru";
  return "Tantangan";
}

export function getVerseAudioUrl(
  surahId: number,
  verseId: number,
  reciterId: string = defaultReciterId,
) {
  const chapter = surahId.toString().padStart(3, "0");
  const verse = verseId.toString().padStart(3, "0");

  return `https://everyayah.com/data/${reciterId}/${chapter}${verse}.mp3`;
}
