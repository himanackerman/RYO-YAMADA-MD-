// WaifuTagger 
// API : https://api.nekolabs.my.id
// Author : Hilman
import fetch from 'node-fetch';
import FormData from 'form-data';

async function uploadToCatbox(buffer) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, 'file.jpg');

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });

  const url = await res.text();
  if (!url.startsWith('http')) throw new Error('❌ Gagal upload ke Catbox');
  return url.trim();
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime || !mime.startsWith('image/')) {
    return m.reply(`🖼️ Balas gambar dulu atau kirim gambar dengan caption: ${usedPrefix + command}`);
  }

  m.reply('✨ Sedang memproses waifu tag…');

  try {
    const buffer = await q.download();
    const imageUrl = await uploadToCatbox(buffer);

    const apiUrl = `https://api.nekolabs.my.id/tools/waifu-tagger?imageUrl=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result) throw new Error('❌ Gagal memproses gambar');

    const { prompt, rating, tags } = json.result;

    let ratingText = rating.map(r => `${r.label}: ${(r.confidence * 100).toFixed(2)}%`).join('\n');
    let tagsText = tags.confidences.map(t => `${t.label}: ${(t.confidence * 100).toFixed(2)}%`).join('\n');

    const caption = `✨ *Waifu Tag Result*\n\n*Prompt:* ${prompt}\n\n*Rating:*\n${ratingText}\n\n*Tags:*\n${tagsText}`;

    await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply(`❌ Terjadi kesalahan saat memproses gambar.\nError: ${e.message}`);
  }
};

handler.help = ['waifutagger', 'wt'];
handler.tags = ['tools', 'ai'];
handler.command = /^(waifutagger|wt)$/i;
handler.limit = true;
handler.register = true;

export default handler;