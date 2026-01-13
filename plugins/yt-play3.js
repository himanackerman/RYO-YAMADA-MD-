import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Gunakan contoh: ${usedPrefix}${command} <judul lagu>`;

  await m.reply('⏳Wait Senpai......');

  try {
    console.log("🔍 Mencari video...");
    const yts = await import('yt-search');
    const searchResult = await yts.default(text);
    
    if (!searchResult.videos.length) throw '⚠️ Video tidak ditemukan, coba pakai kata kunci lain.';
    
    const topVideo = searchResult.videos[0];

    console.log(`✅ Video ditemukan: ${topVideo.title} (${topVideo.url})`);

    console.log("🎶 Mengakses API untuk mengunduh...");
    const { data } = await axios.get(`https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${encodeURIComponent(topVideo.url)}&quality=128kbps`);
    if (!data || data.status !== 200 || !data.result || !data.result.media) throw '⚠️ Gagal mengunduh lagu, coba lagi nanti.';

    const { title, metadata, author, media, quality } = data.result;
    const caption = `
🎵 *Judul:* ${title}
📺 *Channel:* ${author.name}
⏱️ *Durasi:* ${metadata.duration}
👀 *Views:* ${metadata.views}
📆 *Upload:* ${metadata.uploadDate}
🎼 *Kualitas:* ${quality}
🔗 *URL:* ${data.result.url}
    `.trim();

    console.log("📤 Mengirim hasil...");
    
    // Beton
    await conn.sendMessage(m.chat, {
      image: { url: metadata.thumbnail },
      caption,
      footer: "〄MieChan",
      buttons: [
        {
          buttonId: `.ytmp4 ${topVideo.url}`,
          buttonText: { displayText: '📹 versi video' },
          type: 1,
        },
        {
          buttonId: `.play3 ${text}`,
          buttonText: { displayText: '🔍 yang lain' },
          type: 1,
        }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: media },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
    }, { quoted: m });

    await m.reply('✅Done Senpaii');
  } catch (err) {
    console.error("❌ Error terjadi:", err);
    await conn.reply(m.chat, `Terjadi kesalahan: ${err.message}`, m);
    await m.react('❌');
  }
};

handler.help = ['play3 <judul>'];
handler.tags = ['downloader'];
handler.command = /^(play3)$/i;
handler.register = true;
handler.limit = true;

export default handler;