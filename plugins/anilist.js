import axios from 'axios';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

async function populer() {
  try {
    const url = 'https://anilist.co';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const trending = $('.landing-section.trending .results .media-card')
      .map((index, element) => {
        const title = $(element).find('.title').text().trim();
        const link = url + $(element).find('a.cover').attr('href');
        const image = $(element).find('img.image').attr('src');
        return { title, link, image };
      })
      .get();

    const populer = $('.landing-section.season .results .media-card')
      .map((index, element) => {
        const title = $(element).find('.title').text().trim();
        const link = url + $(element).find('a.cover').attr('href');
        const image = $(element).find('img.image').attr('src');
        return { title, link, image };
      })
      .get();

    const upcoming = $('.landing-section.nextSeason .results .media-card')
      .map((index, element) => {
        const title = $(element).find('.title').text().trim();
        const link = url + $(element).find('a.cover').attr('href');
        const image = $(element).find('img.image').attr('src');
        return { title, link, image };
      })
      .get();

    const top = $('.landing-section.top .results .media-card')
      .map((index, element) => {
        const rank = $(element).find('.rank').text().trim();
        const title = $(element).find('.title').text().trim();
        const link = url + $(element).find('a.cover').attr('href');
        const image = $(element).find('img.image').attr('src');
        return { rank, title, link, image };
      })
      .get();

    return { trending, populer, upcoming, top };
  } catch (error) {
    console.error('Error scraping AniList:', error);
    return null;
  }
}

async function search(query) {
  try {
    const { data } = await axios.get(`https://anilist.co/search/anime?query=${encodeURIComponent(query)}`);
    const $ = cheerio.load(data);

    const results = [];

    $('.media-card').each((index, element) => {
      const title = $(element).find('.title').text().trim();
      const imageUrl = $(element).find('.image').attr('src');
      const link = $(element).find('.cover').attr('href');

      if (title && imageUrl && link) {
        results.push({
          title,
          imageUrl,
          link: `https://anilist.co${link}`,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

async function translate(text, lang = 'id') {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    const hasil = data[0][0][0];
    return { status: true, result: { tr: hasil } };
  } catch {
    return { status: false, result: { tr: text } };
  }
}

async function detail(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const cleanText = (text) => text.replace(/\n\s+/g, ' ').trim();

    const safeTranslate = async (text) => {
      const translation = await translate(text);
      return translation.result.tr;
    };

    const descriptionText = cleanText($('.description.content-wrap').text());
    const descriptionParagraphs = descriptionText.split('\n').filter(p => p.trim() !== '');
    const translatedParagraphs = await Promise.all(
      descriptionParagraphs.map(paragraph => safeTranslate(paragraph))
    );

    const results = {
      title: {
        romaji: cleanText($('.content h1').first().text()),
        english: cleanText($('div.data-set:contains("English") .value').text()),
        native: cleanText($('div.data-set:contains("Native") .value').text()),
        translated: {
          romaji: await safeTranslate(cleanText($('.content h1').first().text())),
          english: await safeTranslate(cleanText($('div.data-set:contains("English") .value').text())),
          native: await safeTranslate(cleanText($('div.data-set:contains("Native") .value').text())),
        },
      },
      description: {
        original: descriptionText,
        translated: translatedParagraphs.join('\n\n'),
        paragraphs: {
          original: descriptionParagraphs,
          translated: translatedParagraphs,
        },
      },
      cover: $('.cover-wrap-inner .cover').attr('src'),
      banner: $('.banner').css('background-image')
        ? $('.banner').css('background-image').replace(/^url\(\s*['"]?|['"]?\s*\)$/g, '')
        : null,
      details: {
        format: cleanText($('div.data-set:contains("Format") .value').text()),
        episodes: cleanText($('div.data-set:contains("Episodes") .value').text()),
        status: cleanText($('div.data-set:contains("Status") .value').text()),
        season: cleanText($('div.data-set:contains("Season") .value').text()),
        averageScore: cleanText($('div.data-set:contains("Average Score") .value').text()),
        popularity: cleanText($('div.data-set:contains("Popularity") .value').text()),
      },
      genres: {
        original: $('div.data-set:contains("Genres") .value a').map((i, el) => cleanText($(el).text())).get().join(', '),
        translated: await Promise.all(
          $('div.data-set:contains("Genres") .value a').map((i, el) => safeTranslate(cleanText($(el).text()))).get()
        ),
      },
      studios: {
        original: $('div.data-set:contains("Studios") .value a').map((i, el) => cleanText($(el).text())).get(),
        translated: await Promise.all(
          $('div.data-set:contains("Studios") .value a').map((i, el) => safeTranslate(cleanText($(el).text()))).get()
        ),
      },
    };

    return results;
  } catch (error) {
    return { error: error.message };
  }
}

const handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    if (command === 'anilist') {
      if (!args[0]) {
        return m.reply(`Contoh penggunaan: ${usedPrefix}anilist search <query>`);
      }

      const subCommand = args[0].toLowerCase();
      const query = args.slice(1).join(' ');

      switch (subCommand) {
        case 'search':
          if (!query) return m.reply('Masukkan query pencarian!');
          const searchResults = await search(query);
          if (!searchResults || searchResults.length === 0) {
            return m.reply('Tidak ada hasil ditemukan.');
          }
          const searchMessage = searchResults
            .map((result, index) => `${index + 1}. ${result.title}\nLink: ${result.link}`)
            .join('\n\n');
          await conn.sendMessage(
            m.chat,
            {
              image: { url: searchResults[0].imageUrl }, // Menggunakan gambar pertama dari hasil pencarian
              caption: `Hasil pencarian:\n\n${searchMessage}`,
            },
            { quoted: m }
          );
          break;

        case 'detail':
          if (!query) return m.reply('Masukkan URL anime!');
          const detailResults = await detail(query);
          if (detailResults.error) {
            return m.reply('Gagal mengambil detail anime.');
          }
          const detailMessage = `
📌 *Judul:*
- Romaji: ${detailResults.title.romaji}
- English: ${detailResults.title.english}
- Native: ${detailResults.title.native}

📝 *Deskripsi:*
${detailResults.description.translated}

🎬 *Detail:*
- Format: ${detailResults.details.format}
- Episodes: ${detailResults.details.episodes}
- Status: ${detailResults.details.status}
- Season: ${detailResults.details.season}
- Score: ${detailResults.details.averageScore}
- Popularity: ${detailResults.details.popularity}

🎭 *Genres:*
${detailResults.genres.translated.join(', ')}

🎥 *Studios:*
${detailResults.studios.translated.join(', ')}
`;
          await conn.sendMessage(
            m.chat,
            {
              image: { url: detailResults.cover }, // Menggunakan gambar cover dari detail anime
              caption: detailMessage,
            },
            { quoted: m }
          );
          break;

        case 'populer':
          const populerResults = await populer();
          if (!populerResults) {
            return m.reply('Gagal mengambil data anime populer.');
          }
          const populerMessage = `
🎉 *Trending Anime:*
${populerResults.trending.map((anime, index) => `${index + 1}. ${anime.title}`).join('\n')}

🔥 *Populer Anime:*
${populerResults.populer.map((anime, index) => `${index + 1}. ${anime.title}`).join('\n')}

🚀 *Upcoming Anime:*
${populerResults.upcoming.map((anime, index) => `${index + 1}. ${anime.title}`).join('\n')}

🏆 *Top Anime:*
${populerResults.top.map((anime, index) => `${index + 1}. ${anime.title} (Rank: ${anime.rank})`).join('\n')}
`;
          await conn.sendMessage(
            m.chat,
            {
              image: { url: populerResults.trending[0].image }, // Menggunakan gambar dari anime trending pertama
              caption: populerMessage,
            },
            { quoted: m }
          );
          break;

        default:
          return m.reply(`Subcommand tidak valid. Gunakan ${usedPrefix}anilist search, detail, atau populer.`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    m.reply('Terjadi kesalahan saat memproses permintaan.');
  }
};

handler.help = ['anilist'].map(v => v + ' <search|detail|populer> <query>');
handler.command = /^(anilist)$/i;
handler.tags = ['anime']
handler.limit = false;

export default handler;