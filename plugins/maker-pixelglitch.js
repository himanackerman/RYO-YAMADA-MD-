// plugins/ZenzzXD
import fetch from 'node-fetch';

const handler = async (m, { text, conn }) => {
  if (!text) throw 'Masukkan teks yang ingin diglitch, contoh: .pixelglitch mbappe';

  // Kirim loading message
  await conn.sendMessage(m.chat, { text: 'OTW bangg, sabar yaa...' }, { quoted: m });

  try {
    const url = `https://vapis.my.id/api/pixelglitch?q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw 'Gagal mengambil gambar. Coba lagi nanti.';

    const buffer = await res.buffer();

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `Nohh Hasil untuk: ${text}`
    }, { quoted: m });

  } catch (err) {
    await conn.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
  }
};

handler.help = ['pixelglitch <teks>'];
handler.tags = ['maker'];
handler.command = /^pixelglitch$/i;
handler.premium = false;
handler.limit = false;

export default handler;