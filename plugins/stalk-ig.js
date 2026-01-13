/**
 ╔══════════════════════
      ⧉  [igstalk] — [tools]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ API      : [ https://api.deline.web.id ]
  ✺ Req      : Ikan (84 878××××)
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh: ${usedPrefix + command} bluearchive.post*`);
        }
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let url = `https://api.deline.web.id/stalker/igstalk?username=${encodeURIComponent(text)}`;
        let res = await fetch(url);
        if (!res.ok) throw new Error('Gagal mengambil data dari server');
        let json = await res.json();
        if (!json.status || !json.result) throw new Error('Data tidak ditemukan');

        let r = json.result;
        let caption =
    `*𖣔 Instagram Stalker 𖣔*\n\n` +

    `✧ *Username:* ${r.username}\n` +
    `✧ *Nama:* ${r.fullname || '-'}\n` +
    `✧ *Bio:* ${r.biography || '-'}\n` +
    `✧ *Kategori:* ${r.category || '-'}\n\n` +

    `✧ *Followers:* ${r.followers}\n` +
    `✧ *Following:* ${r.following}\n` +
    `✧ *Postingan:* ${r.posts}\n` +
    `✧ *Verified:* ${r.is_verified ? 'Ya ✔️' : 'Tidak'}\n` +
    `✧ *Private:* ${r.is_private ? 'Ya 🔒' : 'Tidak'}\n\n` +

    `*──── ✧ 𖣔 ✧ ────*`;

        await conn.sendMessage(m.chat, {
            image: { url: r.profile_pic },
            caption
        });
    } catch (e) {
        await m.reply(`*🍂 Yahh gagal memberikan informasi...*\n*• Error:* ${e.message}`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['igstalk'];
handler.tags = ['tools'];
handler.command = /^(igstalk|stalkig)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;