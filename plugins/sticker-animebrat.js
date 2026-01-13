/*

# Fitur : Sticker Animebrat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://fastrestapis.fasturl.cloud

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import fetch from 'node-fetch';
import sharp from 'sharp';

const handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukkan teks untuk stiker.');

    try {
        const apiUrl = `https://fastrestapis.fasturl.cloud/maker/animbrat?text=${encodeURIComponent(text)}&position=center&mode=image`;
        const response = await fetch(apiUrl);
        const buffer = await response.arrayBuffer();

        // Konversi ke format webp agar bisa digunakan di WhatsApp
        const webpBuffer = await sharp(Buffer.from(buffer))
            .toFormat('webp')
            .toBuffer();

        await conn.sendMessage(m.chat, { 
            sticker: webpBuffer 
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('Terjadi kesalahan saat membuat stiker.');
    }
};

handler.command = ['animebrat'];
handler.help = ['animebrat <teks>'];
handler.tags = ['sticker'];
handler.limit = true 

export default handler;