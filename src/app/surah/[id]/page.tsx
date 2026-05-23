import { notFound } from "next/navigation";
import { SurahGame } from "@/components/SurahGame";
import { getSurah, juz30Surahs } from "@/lib/juz30";

export function generateStaticParams() {
  return juz30Surahs.map((surah) => ({
    id: surah.id.toString(),
  }));
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surah = getSurah(Number(id));

  if (!surah) notFound();

  return <SurahGame surah={surah} />;
}
