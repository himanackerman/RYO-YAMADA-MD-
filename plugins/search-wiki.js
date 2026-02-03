import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const CACHE_FILE = './wikipedia_cache.json';

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function scrapeWikipedia(keyword, paragraphCount = 3) {
  const cache = loadCache();

  if (cache[keyword]) {
    console.log(`Mengambil data dari cache untuk: ${keyword}`);
    return cache[keyword];
  }

  try {
    const url = `https://id.m.wikipedia.org/wiki/${encodeURIComponent(keyword)}`;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    if ($('.mw-parser-output').length === 0) {
      throw new Error(`Artikel "${keyword}" tidak ditemukan.`);
    }

    const paragraphs = $('p')
      .map((i, el) => $(el).text().trim())
      .get()
      .filter(p => p);

    if (paragraphs.length === 0) {
      throw new Error(`Tidak Ada Konten Untuk"${keyword}".`);
    }

    const content = paragraphs.slice(0, paragraphCount).join('\n\n');

    const result = { content };
    cache[keyword] = result;
    saveCache(cache);

    return result;
  } catch (error) {
    throw new Error(`Gagal mengambil data untuk "${keyword}": ${error.message}`);
  }
}

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Silakan masukkan kata kunci untuk dicari di Wikipedia.');
  try {
    const result = await scrapeWikipedia(text);
    const message = `*Hasil Pencarian:*\n\n${result.content}`;

    await conn.sendMessage(m.chat, { 
      image: { url: 'https://files.catbox.moe/b21sgz.jpg' }, 
      caption: message 
    }, { quoted: m });
  } catch (error) {
    m.reply(`Error: ${error.message}`);
  }
};

handler.help = ['wiki'];
handler.command = /^(wiki|wikipedia)$/i;
handler.tags = ["search"]
handler.limit = false;

export default handler;