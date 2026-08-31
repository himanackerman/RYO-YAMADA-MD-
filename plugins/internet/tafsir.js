import axios from "axios";
import cheerio from "cheerio";

async function topik(query) {
    try {
        const { data } = await axios.get(`https://tafsirq.com/topik/${query}`);
        const $ = cheerio.load(data);
        let hasil = $('body > div:nth-child(4) > div > div.col-md-6 > div')
            .map((_, el) => {
                const surah = $(el).find('> div.panel-heading.panel-choco > div > div > a').text().trim();
                const tafsir = $(el).find('> div.panel-body.excerpt').text().trim();
                const type = $(el).find('> div.panel-heading.panel-choco > div > div > span').text().trim();

                if (!surah || !tafsir) return null;

                return { surah, tafsir, type };
            })
            .get();

        if (hasil.length < 5) return [{ status: 404, message: "Topik tidak ditemukan atau terlalu sedikit hasil." }];
        
        hasil = hasil.slice(0, Math.min(hasil.length, 10));

        return hasil;
    } catch (error) {
        return [{ status: 500, message: "Terjadi kesalahan saat mengambil data." }];
    }
}

async function handler(m, { conn, text }) {
    if (!text) return m.reply("Masukkan topik tafsir yang ingin dicari.\n\nContoh: *.tafsir Surga*");

    const results = await topik(text);
    if (results[0]?.status === 404) return m.reply("Topik tidak ditemukan atau hasil terlalu sedikit.");
    if (results[0]?.status === 500) return m.reply("Terjadi kesalahan saat mengambil data.");

    let pesan = `*🔍 Hasil Tafsir untuk Topik: ${text}*\n\n`;
    results.forEach((res, i) => {
        pesan += `*${i + 1}. Surah:* ${res.surah} (${res.type})\n`;
        pesan += `📖 *Tafsir:* ${res.tafsir}\n\n`;
    });

    await conn.sendMessage(m.chat, { image: { url: "https://files.catbox.moe/gket5y.jpg" }, caption: pesan }, { quoted: m });
}

handler.help = ['tafsir'];
handler.tags = ['internet'];
handler.command = ['tafsir'];
handler.limit = false;

export default handler;