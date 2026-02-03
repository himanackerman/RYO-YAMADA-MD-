import axios from 'axios';
import cheerio from 'cheerio';

async function googleImg(query) {
  try {
    const { data: html } = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&sclient=mobile-gws-wiz-img&udm=2`);
    const $ = cheerio.load(html);

    const imageUrls = [];
    $('img.DS1iW').each((i, el) => {
      const imgUrl = $(el).attr('src');
      if (imgUrl) imageUrls.push(imgUrl);
    });

    return imageUrls;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

async function handler(m, { text, conn }) {
  if (!text) return m.reply('Masukkan kata kunci pencarian gambar!\n\nContoh: *.googleimg Naruto*');

  const images = await googleImg(text);
  if (images.length < 3) return m.reply('Gambar yang ditemukan kurang dari 3, coba kata kunci lain.');

  let caption = `🔍 *Hasil Pencarian Dari:* ${text}\n📸 *Total Pencarian:* ${images.length}`;
  m.reply(caption);

  let maxImages = images.slice(0, Math.min(5, images.length));
  for (let img of maxImages) {
    await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m });
  }
}

handler.help = ['googleimg'];
handler.tags = ['search']
handler.command = ['googleimg'];
handler.limit = false;

export default handler;