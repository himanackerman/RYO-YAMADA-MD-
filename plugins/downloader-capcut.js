/*
Jangan Hapus Wm Bang 

*Capcut Download  Plugins Esm*

Iya In aja Lah Meski Gak Tawu 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029Vb6lyzMAjPXQZ1kgPc21/102
*/

import axios from 'axios';
import cheerio from 'cheerio';

async function scrapeCapCut(url) {
    if (!url) throw new Error('URL cannot be empty');
    
    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);
    
    return {
        videoUrl: $("video").attr("src") || null
    };
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan URL CapCut\nContoh: .capcut https://www.capcut.com/templates/7445547192938450229');
    
    try {
        m.reply('Tunggu sebentar, sedang memproses...');
        const result = await scrapeCapCut(text);
        
        if (!result.videoUrl) throw new Error('Video tidak ditemukan');
        
        await conn.sendMessage(m.chat, { 
            video: { url: result.videoUrl }
        });

    } catch (error) {
        console.error('Error:', error);
        m.reply('Terjadi kesalahan saat mengunduh template CapCut');
    }
}

handler.help = ['capcut'];
handler.tags = ['downloader'];
handler.command = /^(capcut)$/i;
handler.limit = false;

export default handler;