const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `Gunakan: ${usedPrefix}${command} <channel>`, m);
  }

  const channel = encodeURIComponent(text.trim());

  try {
    await m.react('🔄');

    const res = await fetch(`https://omegatech-api.dixonomega.tech/api/Stalk/Youtube?action=stalk&channel=${channel}`);
    const json = await res.json();

    if (!json.success) {
      return conn.reply(m.chat, 'Gagal mengambil data channel.', m);
    }

    const data = json.data;

    const caption = `— youtube stalk —

❀ name :
${data.name}

❀ id :
${data.id}

❀ url :
${data.url}

❀ subscribers :
${data.subscribers}

❀ video count :
${data.video_count}

❀ verified :
${data.verified ? 'Ya' : 'Tidak'}

❀ about :
${data.about}`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: data.thumbnail },
        caption
      },
      { quoted: m }
    );

    await m.react('✅');
  } catch (e) {
    await m.react('❌');
    conn.reply(m.chat, `Terjadi kesalahan:\n${e.message}`, m);
  }
};

handler.help = ['ytstalk'];
handler.tags = ['stalk'];
handler.command = /^(ytstalk|youtubestalk)$/i;
handler.limit = true;
handler.register = true;

export default handler;