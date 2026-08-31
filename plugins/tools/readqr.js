/**
 ╔══════════════════════
      ⧉  [readqr] — [tools]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Note    : gunain untuk membaca atau decode QR code langsung dari gambar, buat uji coba pake fitur qrcode lalu readqr juga bisa, tq to Zenz telah mencari web atau api nya ygy
*/

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";
        if (!mime.startsWith("image/")) {
            return m.reply(`*Reply atau kirim gambar QR Code*\n*Contoh: ${usedPrefix + command}*`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let buffer = await q.download();
        let form = new FormData();
        form.append("file", new Blob([buffer]), "qrcode.png");

        let res = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
            method: "POST",
            body: form
        });

        let json = await res.json();
        let result = json?.[0]?.symbol?.[0];

        if (!result || result.error || !result.data) {
            return m.reply(`🍂 *Gagal membaca QR Code.*\nPastikan gambar jelas dan tidak blur.`);
        }

        let output = `
📷 *QR Code Berhasil Dibaca*
━━━━━━━━━━━━━━
📄 *Isi QR:*
${result.data}
━━━━━━━━━━━━━━
        `.trim();

        await m.reply(output);
    } catch (e) {
        await m.reply(`🍂 *Terjadi kesalahan saat memproses QR Code.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.help = ["readqr"];
handler.tags = ["tools"];
handler.command = /^(readqr)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;