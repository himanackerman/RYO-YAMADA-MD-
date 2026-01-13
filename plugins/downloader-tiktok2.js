import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
    if (!args[0]) return m.reply('*❌ Masukkan link TikTok!*');

    try {
        const url = `https://api.nekolabs.my.id/downloader/tiktok?url=${encodeURIComponent(args[0])}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.status) return m.reply('*❌ Gagal mengambil video!*');

        const { result } = data;
        const caption = `
🎬 *Judul:* ${result.title}
👤 *Author:* ${result.author.name} (${result.author.username})
🎵 *Music:* ${result.music_info.title} - ${result.music_info.author}
👁️ *Views:* ${result.stats.play}
❤️ *Likes:* ${result.stats.like}
💬 *Komentar:* ${result.stats.comment}
🔗 *Share:* ${result.stats.share}
📅 *Tanggal:* ${result.create_at}
        `.trim();

        await conn.sendMessage(m.chat, { 
            video: { url: result.videoUrl }, 
            caption, 
            thumbnail: await (await fetch(result.cover)).buffer() 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('*⚠️ Terjadi kesalahan saat mengambil video!*');
    }
}

handler.help = ['tiktok3 <url>'];
handler.tags = ['downloader'];
handler.command = /^(tiktok3|tt3)$/i;
handler.limit = true;

export default handler;