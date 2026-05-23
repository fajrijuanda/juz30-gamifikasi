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
