/**
 ╔══════════════════════
      ⧉  [Claila] — [ai]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029Vb5vz4oDjiOfUeW2Mt03
  ✺ Creator  : SXZnightmare
  ✺ API      : [ https://zelapioffciall.koyeb.app ]
  ✺ Req     : Hazel (62851××××)
  ✺ Note    : Session Id opsional aja, kalo mau hapus silahkan..
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh: ${usedPrefix + command} Seberapa pentingnya Rule of Thirds?*`);
        }
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const url = `https://zelapioffciall.koyeb.app/ai/claila?text=${encodeURIComponent(text)}`;
        const r = await fetch(url);
        const j = await r.json();
        if (!j?.status) {
            return m.reply(`*🍂 Gagal mendapatkan respons dari Claila (API).*`);
        }

        const jawab = j.result || 'Tidak ada respons.';
        const sid = j.session_id || '-';
        let caption = `*🤖 Claila Ai*\n\n`;
        caption += `*📝 Pertanyaan:*\n${text}\n\n`;
        caption += `*✨ Jawaban:*\n${jawab}\n\n`;
        caption += `*🆔 Session ID:* ${sid}`;

        await conn.sendMessage(
            m.chat,
            { text: caption },
            { quoted: m.quoted ? m.quoted : m }
        );

    } catch (e) {
        console.log(e);
        await m.reply(`*🍂 Terjadi kesalahan saat memproses permintaan.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['claila'];
handler.tags = ['ai'];
handler.command = /^(claila|aiclaila|askclaila)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;