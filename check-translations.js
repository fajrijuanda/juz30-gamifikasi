const quran = require('quran-json/dist/quran_id.json');

// Print all 6 affected verses with full translation for manual fixing
const affected = [
  { s: 78, v: 4 },
  { s: 78, v: 38 },
  { s: 83, v: 15 },
  { s: 93, v: 7 },
  { s: 94, v: 4 },
  { s: 99, v: 6 },
];

for (const { s, v } of affected) {
  const surah = quran.find(x => x.id === s);
  const verse = surah.verses.find(x => x.id === v);
  console.log(`=== ${surah.transliteration} ${s}:${v} ===`);
  console.log(`Full translation: "${verse.translation}"`);
  console.log('');
  
  // Try automatic cleanup
  let cleaned = verse.translation;
  // Pattern: number before closing paren like "rūḥ894)" -> "rūḥ)"
  // Pattern: "!892)" -> "!)"  or "!892)" -> just remove the number
  // Pattern: ",912)" -> remove number
  // Pattern: "mu914)" -> "mu)"
  cleaned = cleaned.replace(/(\D)\d{3}(\))/g, '$1$2');
  // Pattern: "(Tidak!)" -> "Tidak!" (the paren might need to stay or go depending on context)
  console.log(`Auto-cleaned: "${cleaned}"`);
  console.log('');
}

// Also do a broader scan - check ALL Juz 30 translations for anything unusual
console.log('\n=== BROAD SCAN: All translations with 2+ digit sequences ===\n');
const juz30Ids = Array.from({ length: 37 }, (_, i) => i + 78);
for (const surah of quran) {
  if (!juz30Ids.includes(surah.id)) continue;
  for (const verse of surah.verses) {
    const t = verse.translation || '';
    if (/\d{2,}/.test(t)) {
      console.log(`[${surah.id}:${verse.id}] "${t}"`);
    }
  }
}
