let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw (`Contoh:\n${usedPrefix}${command} Halo?`);

    let who = m.sender;
    let url = await conn.profilePictureUrl(who, 'image').catch(() => null);
    let idch = '120363407318005025@newsletter'; // ISI IDCHNYA DI SINI

    let username = conn.getName(who);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    let q = m.quoted ? m.quoted : m;
    let mime = q.mimetype || '';

    let content = { text };
    if (mime.includes('image')) {
        content = { image: await q.download(), caption: text };
    } else if (mime.includes('video')) {
        content = { video: await q.download(), caption: text };
    } else if (mime.includes('audio')) {
        content = { audio: await q.download(), mimetype: 'audio/mpeg', fileName: 'iyah.mp3', ptt: true };
    }

    content.contextInfo = {
        externalAdReply: {
           // title: "MSG To Chanel",
            body: `Pesan dari ${username}`,
            thumbnailUrl: url,
            sourceUrl: null,
            mediaType: 1,
            renderLargerThumbnail: false,
            showAdAttribution: false
        }
    };

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    m.reply('PESAN MU TELAH TERKIRIM SILAHKAN CEK CHANNEL ANDA');

    await conn.sendMessage(idch, content);
};

handler.command = /^(msgch)$/i;
handler.help = ['msgch'];
handler.tags = ['owner'];
handler.premium = true;
handler.mods = true

export default handler;