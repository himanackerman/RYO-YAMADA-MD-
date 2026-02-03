/*
Jangan Hapus Wm Bang 

*GIF Search  Plugins Esm*

Sudah Send Stiker nya 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E/242
*/

import axios from "axios";
import * as cheerio from "cheerio";
import { Sticker } from 'wa-sticker-formatter';

async function gifsSearch(q) {
    try {
        const searchUrl = `https://tenor.com/search/${q}-gifs`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });
        
        const $ = cheerio.load(data);
        const results = [];

        $("figure.UniversalGifListItem").each((i, el) => {
            const $el = $(el);
            const img = $el.find("img");  
            const gifUrl = img.attr("src");
            const alt = img.attr("alt") || "No description";
            const detailPath = $el.find("a").first().attr("href"); 
            
            if (gifUrl && gifUrl.endsWith('.gif') && detailPath) {
                results.push({
                    gif: gifUrl,
                    alt,
                    link: "https://tenor.com" + detailPath
                });
            }
        });

        return results;
    } catch (error) {
        console.error("Error fetching GIFs:", error);
        return [];
    }
}

const handler = async (m, { conn, text }) => {
    const parts = text.split(',');
    const query = parts[0].trim();
    let count = 15;
    
    if (!query) return m.reply('Masukin Query Nya\n*Example :* .gifsticker query,jumlah atau .gifsticker pocoyo,5');
    
    if (parts[1]) {
        const num = parseInt(parts[1].trim());
        if (!isNaN(num) && num > 0) {
            count = num;
        }
    }
    
    try {
        const gifs = await gifsSearch(query);
        if (!gifs.length) return m.reply(`Gaada GIF Buat ${query}`);
        
        const actualCount = Math.min(count, gifs.length);
        await m.reply(`*Total Result : ${gifs.length} Send ${actualCount} stiker...*`);
        
        for (const item of gifs.slice(0, actualCount)) {
            try {
                const sticker = new Sticker(item.gif, {
                    pack: `${query}`,
                    author: 'Hilman XD',
                    type: 'full',
                    quality: 70
                });
                
                await conn.sendMessage(m.chat, await sticker.toMessage(), {
                    quoted: m
                });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Gagal Convert Ke GIF`, error);
            }
        }
        
    } catch (error) {
        console.error(error);
        m.reply('Error Cba Lagi Nanti :v');
    }
};

handler.help = ['gifsticker <query>,<jumlah>'];
handler.command = ['gifsticker'];
handler.tags = ['sticker'];

export default handler;