import axios from 'axios'
import cheerio from 'cheerio'

async function animequote() {
  try {
    const page = Math.floor(Math.random() * 184)
    const { data } = await axios.get('https://otakotaku.com/quote/feed/' + page)
    const $ = cheerio.load(data)

    const kotodamaLinks = $('div.kotodama-list').map((i, el) => {
      return $(el).find('a.kuroi').attr('href')
    }).get()

    const results = await Promise.all(kotodamaLinks.map(async (url) => {
      const { data: quote } = await axios.get(url)
      const $q = cheerio.load(quote)

      return {
        char: $q('.char-info .tebal a[href*="/character/"]').text().trim(),
        from_anime: $q('.char-info a[href*="/anime/"]').text().trim(),
        episode: $q('.char-info span.meta').text().trim().replace('- ', ''),
        quote: $q('.post-content blockquote p').text().trim()
      }
    }))

    return results
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { conn }) => {
  try {
    let data = await animequote()
    let res = data[Math.floor(Math.random() * data.length)]

    let txt = `╔═══ ❖ • ✦ • ❖ ═══╗
      🌸 *ANIME QUOTES* 🌸
╚═══ ❖ • ✦ • ❖ ═══╝

👤 *Karakter* : ${res.char || '-'}
🎬 *Anime* : ${res.from_anime || '-'}
📺 *Episode* : ${res.episode || '-'}

💭 ❝ ${res.quote || '-'} ❞`

    await conn.reply(m.chat, txt, m)
  } catch (e) {
    await conn.reply(m.chat, '⚠️ Gagal mengambil quote anime, coba lagi ya~', m)
  }
}

handler.help = ['animequotes']
handler.tags = ['anime']
handler.command = /^animequotes$/i
handler.limit = false

export default handler