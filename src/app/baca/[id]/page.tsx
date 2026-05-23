import { notFound } from "next/navigation";
import { SurahReader } from "@/components/SurahReader";
import { getSurah, juz30Surahs } from "@/lib/juz30";

export function generateStaticParams() {
  return juz30Surahs.map((surah) => ({
    id: surah.id.toString(),
  }));
}

export default async function ReadSurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const surah = getSurah(Number(id));

  if (!surah) notFound();

  return <SurahReader surah={surah} />;
}
