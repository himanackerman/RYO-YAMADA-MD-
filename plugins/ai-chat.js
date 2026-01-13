/**
  ╔══════════════════════
      ⧉  [Chatbot] — [ai]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029Vb5vz4oDjiOfUeW2Mt03
  ✺ Creator  : SXZnightmare
  ✺ API      : [ https://zelapioffciall.koyeb.app ]
  ✺ Req      : Hazel (62851××××)
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh: ${usedPrefix + command} Harga keyboard Titan Elite*`);
        }
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const url = `https://zelapioffciall.koyeb.app/ai/chatbot?text=${encodeURIComponent(text)}`;
        const r = await fetch(url);
        const j = await r.json();
        if (!j?.status) {
            return m.reply(`*🍂 Gagal mendapatkan jawaban dari AI.*`);
        }
        
        const jawaban = j.answer || 'Tidak ada jawaban.';
        const caption = `*🤖 Ai Chatbot*\n\n` +
                        `*📝 Pertanyaan:*\n${text}\n\n` +
                        `*✨ Jawaban:*\n${jawaban}`;

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

handler.help = ['aichat'];
handler.tags = ['ai'];
handler.command = /^(aichat|chatbot)$/i;
handler.limit = true;
handler.register = false;

export default handler;