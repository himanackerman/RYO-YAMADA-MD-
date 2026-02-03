/*
📌 Nama Fitur: Cekidch pake cta_copy
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
*/

const { proto } = (await import('@adiwajshing/baileys')).default;

const handler = async (m, { text, command }) => {
  if (!text) return m.reply('Masukkan link channel-nya.');
  if (!text.includes('https://whatsapp.com/channel/')) return m.reply('Link tautan tidak valid.');

  try {
    const id = text.split('https://whatsapp.com/channel/')[1];
    const res = await m.conn.newsletterMetadata("invite", id);

    const infoText = `
*ID:* ${res.id}
*Nama:* ${res.name}
*Total Pengikut:* ${res.subscribers}
*Status:* ${res.state}
*Verified:* ${res.verification === "VERIFIED" ? "Terverifikasi" : "Tidak"}
    `.trim();

    const msg = {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: infoText
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: "Tekan tombol untuk menyalin ID Channel."
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "Salin ID Channel",
                copy_code: res.id
              })
            }
          ]
        })
      })
    };

    await m.conn.relayMessage(m.chat, msg, { messageId: m.key.id });

  } catch (e) {
    console.error(e);
    m.reply("Gagal mengambil data channel. Pastikan link benar.");
  }
};

handler.help = ['cekidch2 <link>'];
handler.tags = ['tools'];
handler.command = ['cekidch2', 'idch2']

export default handler;