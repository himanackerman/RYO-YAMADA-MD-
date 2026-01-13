/*

# Fitur : voice-prabowo
# Type : Plugins ESM
# Convert by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Case by : https://whatsapp.com/channel/0029VaagYHwCnA82hDK7l31D
# Api : https://aihub.xtermai.xyz

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!text) {
        return m.reply(`*Contoh:* ${usedPrefix + command} Halo pak, perkenalkan dirimu`);
    }

    try {
        const message = text.trim();

        let prompt = `Nama kamu adalah Prabowo Subianto, seorang pria yang tegas, penuh wibawa, berbicara dengan serius dan percaya diri. Tanggapi pesan berikut dengan penuh keyakinan: "${message}"`;

        const requestData = { content: message, user: m.sender, prompt: prompt };

        let response = await axios.post('https://luminai.my.id', requestData);
        let generatedText = response.data?.result?.trim() || '';

        console.log('Generated Text:', generatedText)

        if (!generatedText) generatedText = message;
        if (generatedText.length > 250) generatedText = generatedText.slice(0, 250);

        const ttsUrl = `https://aihub.xtermai.xyz/api/text2speech/elevenlabs?text=${encodeURIComponent(generatedText)}&key=Bell409&voice=prabowo`;
        const audioResponse = await fetch(ttsUrl);

        if (!audioResponse.ok) throw new Error('Gagal mengambil audio TTS');

        const audioBuffer = await audioResponse.arrayBuffer();

        await conn.sendMessage(m.chat, { audio: Buffer.from(audioBuffer), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });

    } catch (err) {
        console.error('❌ Error\nLogs error:', err);
        m.reply('❌ Error\nTerjadi kesalahan saat memproses permintaan anda.');
    }
}

handler.help = ['prabowo']
handler.tags = ['ai']
handler.command = /^prabowo$/i
handler.limit = true 
handler.register = true

export default handler