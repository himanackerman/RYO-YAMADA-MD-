/*
✨ YuriPuki
💫 Nama Fitur: RoyalRoad Novel
🤖 Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import axios from 'axios'
import cheerio from 'cheerio'

const handler = async (m, { text, command }) => {
  switch (command) {
    case 'rrsearch':
      if (!text) throw '🔍 Masukkan judul pencarian!'
      return await handleSearch(m, text)

    case 'rrdetail':
      if (!/^https:\/\/www\.royalroad\.com\/fiction\/\d+/.test(text)) throw 'Masukkan URL valid RoyalRoad (fiction)!'
      return await handleDetail(m, text)

    case 'rrlatest':
      return await handleLatest(m)

    case 'rrprofile':
      if (!/^https:\/\/www\.royalroad\.com\/profile\/\d+/.test(text)) throw 'Masukkan URL profil valid RoyalRoad!'
      return await handleProfile(m, text)

    default:
      throw 'Perintah tidak dikenali!'
  }
}

handler.help = ['rrsearch <judul>', 'rrdetail <url>', 'rrlatest', 'rrprofile <url>']
handler.tags = ['novel', 'internet']
handler.command = /^rr(search|detail|latest|profile)$/i

export default handler

// === Handler Implementations ===

async function handleSearch(m, text) {
  const results = await RoyalRoad.search(text)
  if (results?.error) throw results.message
  if (!results.length) throw 'Tidak ada hasil ditemukan.'

  const teks = results.map(v => `
📘 *${v.title}*
📖 ${v.chapters} | ⭐ ${v.rating}
🏷️ ${v.tags.join(', ')}
🔗 ${v.url}
  `.trim()).join('\n\n')

  m.reply(teks)
}

async function handleDetail(m, url) {
  const res = await RoyalRoad.detail(url)
  if (res?.error) throw res.message

  m.reply(`📘 *${res.title}*
👤 Author: ${res.author}
📖 Chapters: ${res.chapters.length}
🔗 Start Reading: ${res.startReadingLink}
💎 Patreon: ${res.patreon || '-'}
🏆 Achievements: ${res.achievements.join(', ') || '-'}`)
}

async function handleLatest(m) {
  const res = await RoyalRoad.latest()
  if (res?.error) throw res.message

  const teks = res.map(v => `📘 *${v.title}*\n🔗 ${v.link}`).join('\n\n')
  m.reply(teks)
}

async function handleProfile(m, url) {
  const res = await RoyalRoad.profile(url)
  if (res?.error) throw res.message

  m.reply(`👤 *${res.username}*
🗓️ Joined: ${res.joined}
📍 Location: ${res.location}
📚 Fictions: ${res.author.fictions}
✍️ Reviews: ${res.stats.reviews}
💬 Bio: ${res.bio}`)
}

// === RoyalRoad Scraper Core ===

class RoyalRoad {
  static base = 'https://www.royalroad.com'

  static async search(q) {
    try {
      const { data } = await axios.get(`${this.base}/fictions/search?title=${encodeURIComponent(q)}&globalFilters=true`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const $ = cheerio.load(data)
      const results = []

      $('.fiction-list-item').each((_, el) => {
        const title = $(el).find('.fiction-title a').text().trim()
        const url = this.base + $(el).find('.fiction-title a').attr('href')
        const cover = $(el).find('img').attr('src')
        const type = $(el).find('span.label').first().text().trim()
        const status = $(el).find('span.label').eq(1).text().trim()
        const tags = []
        $(el).find('.fiction-tag').each((_, t) => tags.push($(t).text().trim()))
        const followers = $(el).find('i.fa-users').parent().text().trim()
        const rating = $(el).find('i.fa-star').parent().text().trim()
        const pages = $(el).find('i.fa-book').parent().text().trim()
        const views = $(el).find('i.fa-eye').parent().text().trim()
        const chapters = $(el).find('i.fa-list').parent().text().trim()
        const lastUpdate = $(el).find('i.fa-calendar').parent().text().trim()
        const description = $(el).find('[id^="description-"]').text().trim()

        results.push({ title, url, cover, type, status, tags, followers, rating, pages, views, chapters, lastUpdate, description })
      })

      return results
    } catch (e) {
      return { error: true, message: e.message }
    }
  }

  static async detail(url) {
    try {
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const $ = cheerio.load(data)

      const title = $('h1.font-white').text().trim()
      const author = $('.fic-title a').first().text().trim()
      const authorUrl = this.base + $('.fic-title a').attr('href')
      const cover = $('.cover-art-container img').attr('src')
      const startReadingLink = this.base + $('.fic-buttons a.btn-primary').attr('href')
      const patreon = $('.dropdown-content a[rel="nofollow"]').attr('href') || null

      const achievements = []
      $('.portlet-body img.popovers').each((_, el) => {
        const title = $(el).attr('data-original-title')
        if (title) achievements.push(title.trim())
      })

      const chapters = []
      $('table#chapters tbody tr').each((_, el) => {
        const chapterTitle = $(el).find('td a').text().trim()
        const chapterUrl = this.base + $(el).find('td a').attr('href')
        const releaseDate = $(el).find('td .fiction-info').text().trim()
        if (chapterTitle) chapters.push({ title: chapterTitle, url: chapterUrl, releaseDate })
      })

      return { title, author, authorUrl, cover, startReadingLink, patreon, achievements, chapters }
    } catch (e) {
      return { error: true, message: e.message }
    }
  }

  static async latest() {
    try {
      const { data } = await axios.get(`${this.base}/fictions/latest-updates`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const $ = cheerio.load(data)
      const results = []

      $('.fiction-list-item').each((_, el) => {
        const item = $(el)
        const title = item.find('.fiction-title a').text().trim()
        const link = this.base + item.find('.fiction-title a').attr('href')
        results.push({ title, link })
      })

      return results
    } catch (e) {
      return { error: true, message: e.message }
    }
  }

  static async profile(url) {
    try {
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const $ = cheerio.load(data)
      const cleanText = (text) => text.replace(/\s+/g, ' ').trim()

      const username = cleanText($('.profile-stats .username h1').text())
      const avatar = $('.avatar-container-general img').attr('src')
      const joined = cleanText($('th:contains("Joined:")').next().text())
      const lastActive = cleanText($('th:contains("Last Active:")').next().text())
      const gender = cleanText($('th:contains("Gender:")').next().text())
      const location = cleanText($('th:contains("Location:")').next().text())
      const bio = cleanText($('th:contains("Bio:")').next().text())

      const statValue = $('.profile-stats .stat-value')
      const stats = {
        follows: cleanText(statValue.eq(0).text()),
        favorites: cleanText(statValue.eq(1).text()),
        reviews: cleanText(statValue.eq(2).text()),
        fictions: cleanText(statValue.eq(3).text())
      }

      const author = {
        fictions: cleanText($('th:contains("Fictions:")').next().text()),
        totalWords: cleanText($('th:contains("Total Words:")').next().text()),
        totalReviews: cleanText($('th:contains("Total Reviews Received:")').next().text()),
        totalRatings: cleanText($('th:contains("Total Ratings Received:")').next().text()),
        followers: cleanText($('th:contains("Followers:")').next().text()),
        favorites: cleanText($('th:contains("Favorites:")').last().next().text())
      }

      return {
        username, avatar, joined, lastActive, gender, location, bio, stats, author
      }
    } catch (err) {
      return { error: true, message: err.message }
    }
  }
}