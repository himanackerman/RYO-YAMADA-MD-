import axios from "axios";
import cheerio from "cheerio";

const surahList = [
  "Al Fatihah", "Al Baqarah", "Ali Imran", "An Nisa", "Al Maidah", "Al Anam", "Al Araf", "Al Anfal", 
  "At Taubah", "Yunus", "Hud", "Yusuf", "Ar Rad", "Ibrahim", "Al Hijr", "An Nahl", "Al Isra", "Al Kahfi", 
  "Maryam", "Taha", "Al Anbiya", "Al Hajj", "Al Muminun", "An Nur", "Al Furqan", "Asy Syuara", "An Naml", 
  "Al Qasas", "Al Ankabut", "Ar Rum", "Luqman", "As Sajdah", "Al Ahzab", "Saba", "Fatir", "Yasin", "As Saffat", 
  "Sad", "Az Zumar", "Gafir", "Fussilat", "Asy Syura", "Az Zukhruf", "Ad Dukhan", "Al Jasiyah", "Al Ahqaf", 
  "Muhammad", "Al Fath", "Al Hujurat", "Qaf", "Az Zariyat", "At Tur", "An Najm", "Al Qamar", "Ar Rahman", 
  "Al Waqiah", "Al Hadid", "Al Mujadilah", "Al Hasyr", "Al Mumtahanah", "As Saff", "Al Jumuah", "Al Munafiqun", 
  "At Tagabun", "Al Talaq", "At Tahrim", "Al Mulk", "Al Qalam", "Al Haqqah", "Al Maarij", "Nuh", "Al Jinn", 
  "Al Muzzammil", "Al Muddassir", "Al Qiyamah", "Al Insan", "Al Mursalat", "An Naba", "An Naziat", "Abasa", 
  "At Takwir", "Al Infitar", "Al Mutaffifin", "Al-Insyiqaq", "Al Buruj", "At Tariq", "Al Ala", "Al-Gasyiyah", 
  "Al Fajr", "Al Balad", "Asy Syams", "Al Lail", "Ad Duha", "Asy Syarh", "At Tin", "Al Alaq", "Al Qadr", 
  "Al Bayyinah", "Al Zalzalah", "Al Adiyat", "Al Qariah", "At Takasur", "Al Asr", "Al Humazah", "Al Fil", 
  "Al Quraisy", "Al Maun", "Al Kausar", "Al Kafirun", "An Nasr", "Al Lahab", "Al Ikhlas", "Al Falaq", "An Nas"
];

async function selectSurah(link) {
  let { data } = await axios.get(link);
  const $ = cheerio.load(data);
  const result = [];
  const isi = [];
  let surah = $("body > main > article > h1").text();
  let bismillah = $("body > main > article > p").text();
  
  $("body > main > article > ol > li:nth-child(n)").each((i, e) => {
    const arabic = $(e).find("p.arabic").text();
    const baca = $(e).find("p.translate").text();
    const arti = $(e).find("p.meaning").text();
    isi.push({
      arabic,
      baca,
      arti,
    });
  });

  result.push({ surah, bismillah }, isi);
  return result;
}

async function listSurah() {
  let { data } = await axios.get("https://litequran.net/");
  const $ = cheerio.load(data);
  const result = [];
  
  $("body > main > ol > li:nth-child(n)").each((i, e) => {
    const nameSurah = $(e).find("a").text();
    const link = "https://litequran.net/" + $(e).find("a").attr("href");
    result.push({
      link,
      nameSurah,
    });
  });

  return result;
}

async function getSurah(query) {
  let surahIndex;

  if (!isNaN(query)) {
    surahIndex = Number(query);
  } else {
    surahIndex = surahList.findIndex((s) => s.toLowerCase() === query.toLowerCase()) + 1;
  }

  if (surahIndex < 1 || surahIndex > surahList.length) {
    let listSurahText = surahList.map((s, i) => `${i + 1}. ${s}`).join("\n");
    return `*Nomor/Surah yang kamu cari tidak ada! Pastikan benar.*\n\n📜 *Berikut daftar surah dan nomor urutnya:*\n\n${listSurahText}`;
  }

  const surahListData = await listSurah();
  const selectedSurah = surahListData[surahIndex - 1];
  const surahContent = await selectSurah(selectedSurah.link);

  let response = `*Surah ${surahContent[0].surah}*\n`;
  response += `\n${surahContent[0].bismillah}\n\n`;
  response += `📜 *Ayat-ayatnya sebagai berikut:*\n\n`;

  surahContent[1].forEach((ayah, index) => {
    response += `*𖦹 Ayat ${index + 1}:*\n`;
    response += ` ${ayah.arabic}\n`;
    
    response += ` ${ayah.baca}\n`;
    
    response += ` ${ayah.arti}\n\n`;
  });

  response += `\n🤲 *Semoga kita diberkahi dengan petunjuk dari ayat-ayat ini.*\n`;

  return response;
}

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply("Masukkan nomor atau nama surah yang ingin dicari!");

  let surahData = await getSurah(text);

  conn.sendMessage(m.chat, { 
    image: { url: "https://files.catbox.moe/8prddw.jpg" }, 
    caption: surahData 
  }, { quoted: m });
};

handler.help = ["surah"];
handler.tags = ['internet']
handler.command = ["surah"];
handler.limit = false;

export default handler;