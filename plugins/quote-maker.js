/*
📌 Nama Fitur: quote maker
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
🔗 Api : https://fastmanager.fasturl.cloud
✍️ Convert By ZenzXD
*/

const handler = async (m, { text, quoted }) => {
  const defaultPP = 'https://fastmanager.fasturl.cloud/Uploads/Hikaru-PP.png';
  const defaultSignature = '@ZenzzXD';
  const name = m.name || 'User';

  if (!text) return m.reply(`Masukkan teks quote!\nContoh: *quote Hidup cuma sekali | https://example.com/pp.jpg*`);

  let [quoteText, ppUrl] = text.split('|').map(a => a.trim());
  if (!quoteText) return m.reply('Teks quote tidak boleh kosong.');
  if (ppUrl && !/^https?:\/\//.test(ppUrl)) return m.reply('URL foto profil tidak valid.');

  const quoteApi = `https://fastrestapis.fasturl.cloud/maker/quote?text=${encodeURIComponent(quoteText)}&username=${encodeURIComponent(name)}&ppUrl=${encodeURIComponent(ppUrl || defaultPP)}&signature=${encodeURIComponent(defaultSignature)}`;

  try {
    await conn.sendMessage(m.chat, {
      image: { url: quoteApi },
      caption: `kata kata hari ini dari *${name}*`
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('Gagal mengambil gambar quote, coba lagi nanti.');
  }
};

handler.help = ['quote <teks> | <ppUrl>'];
handler.tags = ['quotes'];
handler.command = /^quote$/i;

export default handler;