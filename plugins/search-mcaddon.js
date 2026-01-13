import axios from 'axios';
import cheerio from 'cheerio';

async function searchAddons(name) {
  const { data } = await axios.get(`https://mmcreviews.com/?s=${name}&id=1274&post_type=post`);
  const $ = cheerio.load(data);
  const modpacks = [];

  $('.post').each((i, element) => {
    const title = $(element).find('.entry-title a').text().trim();
    const link = $(element).find('.entry-title a').attr('href');
    const description = $(element).find('.ast-excerpt-container p').text().trim();
    const rating = $(element).find('.glsr-summary-rating .glsr-tag-value').text().trim();
    const tags = [];
    $(element).find('.taxonomy-tag a').each((_, tag) => {
      tags.push($(tag).text().trim());
    });

    modpacks.push({ title, link, description, rating, tags });
  });

  return modpacks;
}

async function detailAddons(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const image = $('figure img').attr('src');
  const title = $('h1').text().trim();
  const subtitle = $('h4').text().trim();
  const gameplay = $('.stk-block-text__text').text().trim();

  return { image, title, subtitle, gameplay };
}

async function getAddonInfo(query) {
  const addons = await searchAddons(query);
  if (!addons.length) return '*❌ Tidak ditemukan addon dengan kata kunci tersebut*';

  const addon = addons[0];
  const details = await detailAddons(addon.link);

  return {
    text: `🛠 *${addon.title}*\n\n📖 *Deskripsi:* ${addon.description}\n⭐ *Rating:* ${addon.rating || 'N/A'}\n🏷 *Tags:* ${addon.tags.join(', ') || 'N/A'}\n\n🎮 *Gameplay:* ${details.gameplay || 'Tidak tersedia'}\n🔗 *Link:* ${addon.link}`,
    image: details.image
  };
}

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('*🔍 Masukkan query untuk mencari addon*');

  const result = await getAddonInfo(text);
  
  if (typeof result === 'string') {
    return m.reply(result);
  }

  return conn.sendMessage(m.chat, { 
    image: { url: result.image },
    caption: result.text 
  });
};

handler.help = ['mcaddon'];
handler.tags = ['search']
handler.command = ['mcaddon'];

export default handler;