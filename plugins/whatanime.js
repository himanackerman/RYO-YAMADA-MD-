// • What Anime 
// • Type : Plugins ESM 
// • API : https://api.deline.my.id
// • Author: Hilman
import fetch from "node-fetch";
import FormData from "form-data";

let handler = async (m, { conn, usedPrefix, command }) => {
  const fkontak = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'RyoYamada'
    },
    message: {
      locationMessage: {
        name: `✨ Ryo Sedang Menganalisis Gambar Anime...`,
        jpegThumbnail: ''
      }
    }
  };

  await conn.sendMessage(m.chat, { react: { text: "🍡", key: m.key }});

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime.startsWith('image/')) {
    await conn.sendMessage(m.chat, { react: { text: "⛔️", key: m.key }});
    return conn.sendMessage(m.chat, {
      text: `🌸 *Penggunaan Fitur Salah!*
━━━━━━━━━━━━━━━━
📌 *Contoh Penggunaan:*
\`\`\`${usedPrefix + command}\`\`\`
Kirim atau reply *gambar anime* untuk diidentifikasi.
━━━━━━━━━━━━━━━━
💡 *Ryo akan mencari tahu dari scene yang kamu kirim!*`,
    }, { quoted: fkontak });
  }

  try {
    let media = await q.download();

    await conn.sendMessage(m.chat, { react: { text: "🍡", key: m.key }});

    const imageUrl = await uploadImage(media);

    const result = await whatAnime(imageUrl);

    if (!result.status || !result.result) throw new Error("Gagal mengenali anime.");

    const data = result.result;

    let caption = `🎌 *WHAT ANIME IS THIS?*
━━━━━━━━━━━━━━━━
🎬 *Judul:* ${data.title}
👤 *Karakter:* ${data.character || 'Tidak diketahui'}
✨ *Genre:* ${data.genres?.join(', ') || '-'}
━━━━━━━━━━━━━━━━
📖 *Sinopsis:*
${data.synopsis || '-'}
━━━━━━━━━━━━━━━━
🍭 *Deskripsi:*
${data.description || '-'}
━━━━━━━━━━━━━━━━
🔗 *Referensi:*
${data.references?.map(v => `• ${v}`).join('\n') || '-'}
━━━━━━━━━━━━━━━━
✨ *Analisis selesai — Ryo berhasil menemukan data anime ini!*`;

    await conn.sendMessage(m.chat, {
      text: caption,
    }, { quoted: fkontak });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }});

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "⛔️", key: m.key }});
    await conn.sendMessage(m.chat, {
      text: `⚠️ *Terjadi Kesalahan Saat Menganalisis Gambar!*
━━━━━━━━━━━━━━━━
\`\`\`${e.message}\`\`\`
━━━━━━━━━━━━━━━━
🍭 *Coba kirim ulang gambar atau gunakan gambar lain ya!*`,
    }, { quoted: fkontak });
  }
};

async function uploadImage(buffer) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'anime.jpg' });

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });

    const url = await res.text();
    if (url.startsWith('http')) return url.trim();
    throw new Error('Upload gagal ke Catbox.');
  } catch (e) {
    throw new Error('Gagal upload gambar: ' + e.message);
  }
}

async function whatAnime(imageUrl) {
  try {
    const apiUrl = `https://api.deline.my.id/tools/whatanime?url=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "API error");
    return data;
  } catch (err) {
    throw new Error("WhatAnime API gagal: " + err.message);
  }
}

handler.help = ['whatanime', 'animecheck', 'identifyanime'];
handler.tags = ['tools', 'anime'];
handler.command = /^(whatanime|animecheck|identifyanime)$/i;
handler.limit = true;
handler.register = true;

export default handler;