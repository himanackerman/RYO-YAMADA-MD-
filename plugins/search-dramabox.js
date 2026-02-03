import axios from 'axios'
import * as cheerio from 'cheerio'

/***
  @ Base: https://dramabox.web.id/
  @ Author: Shannz
  @ Bot Feature: YogiriMD
***/

const CONFIG = {
  BASE_URL: 'https://dramabox.web.id',
  HEADERS: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
}

const request = async (url) => {
  const res = await axios.get(url, { headers: CONFIG.HEADERS })
  return cheerio.load(res.data)
}

const resolveUrl = (link) => {
  if (link && !link.startsWith('http'))
    return `${CONFIG.BASE_URL}/${link.replace(/^\//, '')}`
  return link
}

const getBookIdFromUrl = (url) => {
  try {
    return new URL(url).searchParams.get('bookId')
  } catch {
    return null
  }
}

/* =========================
   SCRAPER CORE
========================= */
const dramabox = {
  home: async () => {
    const $ = await request(CONFIG.BASE_URL)

    const latest = []
    $('.drama-grid .drama-card').each((_, el) => {
      const link = resolveUrl($(el).find('.watch-button').attr('href'))
      latest.push({
        title: $(el).find('.drama-title').text().trim(),
        book_id: getBookIdFromUrl(link),
        image: $(el).find('.drama-image img').attr('src'),
        views: $(el).find('.drama-meta span').first().text().trim(),
        episodes: $(el)
          .find('.drama-meta span[itemprop="numberOfEpisodes"]')
          .text()
          .trim()
      })
    })

    const trending = []
    $('.sidebar-widget .rank-list .rank-item').each((_, el) => {
      const link = resolveUrl($(el).attr('href'))
      trending.push({
        rank: $(el).find('.rank-number').text().trim(),
        title: $(el).find('.rank-title').text().trim(),
        book_id: getBookIdFromUrl(link),
        image: $(el).find('.rank-image img').attr('src'),
        views: $(el).find('.rank-meta span').eq(0).text().trim(),
        episodes: $(el).find('.rank-meta span').eq(1).text().trim()
      })
    })

    return { latest, trending }
  },

  search: async (query) => {
    const $ = await request(
      `${CONFIG.BASE_URL}/search.php?lang=in&q=${encodeURIComponent(query)}`
    )

    const res = []
    $('.drama-grid .drama-card').each((_, el) => {
      const link = resolveUrl($(el).find('.watch-button').attr('href'))
      res.push({
        title: $(el).find('.drama-title').text().trim(),
        book_id: getBookIdFromUrl(link),
        views: $(el).find('.drama-meta span').first().text().trim(),
        image: $(el).find('.drama-image img').attr('src')
      })
    })

    return res
  },

  detail: async (bookId) => {
    const $ = await request(
      `${CONFIG.BASE_URL}/watch.php?bookId=${bookId}&lang=in`
    )

    const fullTitle = $('.video-title').text().trim()
    const cleanTitle = fullTitle.split('- Episode')[0].trim()

    const episodes = []
    $('.episodes-grid .episode-btn').each((_, el) => {
      episodes.push({
        episode: parseInt($(el).text().trim()),
        id: $(el).attr('data-episode')
      })
    })

    return {
      book_id: bookId,
      title: cleanTitle,
      description: $('.video-description').text().trim(),
      thumbnail: $('meta[itemprop="thumbnailUrl"]').attr('content'),
      upload_date: $('meta[itemprop="uploadDate"]').attr('content'),
      followers: $('.video-meta span').first().text().trim(),
      total_episodes: $('span[itemprop="numberOfEpisodes"]').text().trim(),
      episode_list: episodes
    }
  },

  stream: async (bookId, episode) => {
    const $ = await request(
      `${CONFIG.BASE_URL}/watch.php?bookId=${bookId}&lang=in&episode=${episode}`
    )

    let videoUrl = $('#mainVideo source').attr('src')
    if (!videoUrl) videoUrl = $('#mainVideo').attr('src')

    return {
      book_id: bookId,
      episode,
      video_url: videoUrl
    }
  }
}

/* =========================
   BOT HANDLER
========================= */
let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `🎬 *DRAMABOX*\n\n` +
        `${usedPrefix + command} home\n` +
        `${usedPrefix + command} search <judul>\n` +
        `${usedPrefix + command} detail <bookId>\n` +
        `${usedPrefix + command} play <bookId> <episode>`
    )

  try {
    // HOME
    if (text === 'home') {
      const { latest, trending } = await dramabox.home()
      let txt = '🔥 *Trending*\n\n'
      trending.slice(0, 5).forEach((v) => {
        txt += `• ${v.rank}. ${v.title}\nID: ${v.book_id}\n\n`
      })
      return conn.sendMessage(
        m.chat,
        { image: { url: trending[0].image }, caption: txt },
        { quoted: m }
      )
    }

    // SEARCH
    if (args[0] === 'search') {
      const q = args.slice(1).join(' ')
      const res = await dramabox.search(q)
      if (!res.length) return m.reply('❌ Tidak ditemukan')

      let list = res
        .map((v, i) => `${i + 1}. ${v.title}\nID: ${v.book_id}`)
        .join('\n\n')

      return conn.sendMessage(
        m.chat,
        {
          image: { url: res[0].image },
          caption: `🔍 *Hasil Pencarian*\n\n${list}`
        },
        { quoted: m }
      )
    }

    // DETAIL
    if (args[0] === 'detail') {
      const d = await dramabox.detail(args[1])
      let ep = d.episode_list
        .slice(0, 10)
        .map((v) => `• Episode ${v.episode}`)
        .join('\n')

      return conn.sendMessage(
        m.chat,
        {
          image: { url: d.thumbnail },
          caption:
            `🎞 *${d.title}*\n\n` +
            `${d.description}\n\n` +
            `Followers: ${d.followers}\n` +
            `Total Episode: ${d.total_episodes}\n\n` +
            `📺 Episode:\n${ep}`
        },
        { quoted: m }
      )
    }

    // PLAY
    if (args[0] === 'play') {
      const s = await dramabox.stream(args[1], args[2])
      return conn.sendMessage(
        m.chat,
        {
          video: { url: s.video_url },
          caption: `🎬 Episode ${args[2]}`
        },
        { quoted: m }
      )
    }
  } catch (e) {
    m.reply('❌ Error:\n' + e.message)
  }
}

handler.command = ['dramabox', 'dbox']
handler.tags = ['search', 'dracin']
handler.help = ['dramabox']

export default handler