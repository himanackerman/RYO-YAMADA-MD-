import { wallpaper } from "../../lib/scrape.js";

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let query = text
    if (!query) throw `Input *URL*`;
    m.reply(wait);
    try {
        let wallpapers = await wallpaper(query);
        
        if (!wallpapers || !wallpapers.length) {
            return m.reply('Gambar tidak ditemukan.');
        }

        const album = wallpapers.slice(0, 10).map((url, i) => ({
            image: url,
            caption: `Source: wallpaperflare.com (${i + 1})`
        }));

        await conn.sendAlbum(
            m.chat,
            album,
            { quoted: m, delay: 1500 }
        );
    } catch (e) {
        console.log(e);
        m.reply(`Error`);
    }
};

handler.help = ['wallpaper' + ' <query>']
handler.tags = ['downloader']
handler.command = /^wallpaper$/i

export default handler