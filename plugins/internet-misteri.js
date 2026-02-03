import axios from "axios";
import * as cheerio from "cheerio";

const RumahMisteri = {
    random: async () => {
        try {
            let url = "https://rumahmisteri.com/";
            let { data } = await axios.get(url);
            let $ = cheerio.load(data);
            let articles = [];

            $(".archive-grid-post-wrapper article").each((i, el) => {
                let title = $(el).find("h2.entry-title a").text().trim();
                let link = $(el).find("h2.entry-title a").attr("href");
                let image = $(el).find(".post-thumbnail img").attr("src");
                let category = $(el).find(".post-cats-list a").text().trim();
                let date = $(el).find(".posted-on time").attr("datetime");

                if (title && link) {
                    articles.push({ title, link, image, category, date });
                }
            });

            return articles.length ? articles[Math.floor(Math.random() * articles.length)] : null;
        } catch {
            return null;
        }
    }
};

let handler = async (m, { conn }) => {
    let article = await RumahMisteri.random();
    
    if (!article) {
        return m.reply("Gagal mengambil artikel. Coba lagi nanti.");
    }

    let { title, link, image, category, date } = article;
    let caption = `*Judul:* ${title}\n*Kategori:* ${category}\n*Tanggal:* ${date}\n\n*Baca lebih lanjut:*\n${link}\n\n`;

    conn.sendMessage(m.chat, { 
        image: { url: image },
        caption 
    });
};

handler.help = ['misteri'];
handler.tags = ['internet']
handler.command = ['misteri'];
handler.limit = false;

export default handler;