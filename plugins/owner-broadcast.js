const handler = async (m, { conn, text, quoted, mime, prefix, command }) => {
  if (!text) throw `*Penggunaan salah!*\nGunakan: .bcgc teks\n\ untuk broadcast.`;

  let getGroups = await conn.groupFetchAllParticipating();
  let groups = Object.entries(getGroups).map(entry => entry[1]);
  let groupIds = groups.map(v => v.id);

  m.reply(`🚀 Mengirim broadcast ke *${groupIds.length}* grup...\nEstimasi selesai dalam *${groupIds.length * 5} detik*`);

  
  const fakeQuoted = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      conversation: "RYO YAMADA - MD"
    }
  };

  for (let id of groupIds) {
    await new Promise(resolve => setTimeout(resolve, 5000)); //timer detik nya, ubah aj sesuka hti 

    if (quoted && /image/.test(mime)) {
      let media = await quoted.download();
      await conn.sendMessage(id, { image: media, caption: text }, { quoted: fakeQuoted });
    } else if (quoted && /video/.test(mime)) {
      let media = await quoted.download();
      await conn.sendMessage(id, { video: media, caption: text }, { quoted: fakeQuoted });
    } else {
      await conn.sendMessage(id, { text }, { quoted: fakeQuoted });
    }
  }

  m.reply('✅ Berhasil broadcast ke semua grup!');
};

handler.help = ['broadcast <teks>'];
handler.tags = ['owner'];
handler.command = /^bcgc|broadcast$/i;
handler.owner = true;

export default handler;