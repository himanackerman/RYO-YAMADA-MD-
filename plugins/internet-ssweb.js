import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Contoh:\n${usedPrefix + command} https://google.com`);

  const url = encodeURIComponent(args[0]);
  const apiURL = `https://nirkyy.koyeb.app/api/v1/ssweb?url=${url}&browserWidth=1280&browserHeight=720&fullPage=false&deviceScaleFactor=1&format=png`;

  try {
    let { data } = await axios.get(apiURL, {
      responseType: 'arraybuffer'
    });

    await conn.sendMessage(m.chat, { image: data, caption: 'Nih hasil screenshot-nya bang!' }, { quoted: m });
  } catch (e) {
    console.error(e);
    m.reply('Gagal screenshot bang. Cek lagi URL-nya atau coba nanti.');
  }
};

handler.help = ['ssweb <url>'];
handler.tags = ['tools'];
handler.command = /^ssweb$/i;
handler.limit = true;

export default handler;