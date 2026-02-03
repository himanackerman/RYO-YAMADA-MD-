import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

/* =========================
   SCRAPER ASLI (DIPAKAI APA ADANYA)
========================= */
class SakuraNovel {
  async getHTML(url, options = {}) {
    const { method = 'GET', data = null, headers = {} } = options
    const config = {
      method: method.toLowerCase(),
      url: `https://cors.caliph.my.id/${url}`,
      headers
    }
    if (method === 'POST') config.data = data
    const { data: html } = await axios(config)
    return cheerio.load(html)
  }

  async search(query) {
    const $ = await this.getHTML(
      'https://sakuranovel.id/wp-admin/admin-ajax.php',
      {
        method: 'POST',
        data: new URLSearchParams({
          action: 'data_fetch',
          keyword: query
        }).toString(),
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          origin: 'https://sakuranovel.id',
          referer: 'https://sakuranovel.id/',
          'x-requested-with': 'XMLHttpRequest'
        }
      }
    )

    return $('.searchbox')
      .map((_, el) => ({
        title: $(el).find('.searchbox-title').text().trim(),
        cover:
          'https://cors.caliph.my.id/' +
          $(el)
            .find('.searchbox-thumb img')
            .attr('src')
            ?.replace('i0.wp.com/', '')
            ?.split('?')[0],
        type: $(el).find('.type').text().trim(),
        status: $(el).find('.status').text().trim(),
        url: $(el).find('a').attr('href')
      }))
      .get()
  }

  async detail(url) {
    const $ = await this.getHTML(url)

    const chapters = $('.series-chapterlists li')
      .map((_, el) => {
        const a = $(el).find('a')
        return {
          title: a.find('span').first().text().trim(),
          url: a.attr('href')
        }
      })
      .get()

    return {
      title: $('.series-titlex h2').text().trim(),
      cover:
        'https://cors.caliph.my.id/' + $('.series-thumb img').attr('src'),
      synopsis: $('.series-synops p')
        .map((_, p) => $(p).text().trim())
        .get()
        .join('\n\n'),
      chapters
    }
  }

  async chapter(url) {
    const $ = await this.getHTML(url)
    const contentBox = $('.tldariinggrissendiribrojangancopy')

    const images = contentBox
      .find('img')
      .map((_, el) => $(el).attr('src') || $(el).attr('data-src'))
      .get()
      .filter(Boolean)

    const text = contentBox
      .find('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .join('\n\n')

    return { images, text }
  }
}

/* =========================
   BOT FEATURE (FIXED)
========================= */
const sakura = new SakuraNovel()

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!text)
    return m.reply(
      `📚 *SakuraNovel*\n\n` +
      `• ${usedPrefix + command} <judul>\n` +
      `• ${usedPrefix + command} detail <url>\n` +
      `• ${usedPrefix + command} read <url>`
    )

  try {
    /* ================= SEARCH ================= */
    if (!text.startsWith('detail') && !text.startsWith('read') && !text.startsWith('http')) {
      const res = await sakura.search(text)
      if (!res.length) return m.reply('❌ Tidak ditemukan')

      const list = res
        .map(
          (v, i) =>
            `${i + 1}. *${v.title}*\n${v.type} | ${v.status}\n${v.url}`
        )
        .join('\n\n')

      return conn.sendMessage(
        m.chat,
        {
          image: { url: res[0].cover },
          caption: `📚 *Hasil Pencarian*\n\n${list}`
        },
        { quoted: m }
      )
    }

    /* ================= DETAIL ================= */
    if (text.startsWith('detail')) {
      const url = text.replace('detail', '').trim()
      const d = await sakura.detail(url)

      const ch = d.chapters
        .slice(0, 15)
        .map(v => `• ${v.title}\n${v.url}`)
        .join('\n\n')

      return conn.sendMessage(
        m.chat,
        {
          image: { url: d.cover },
          caption:
            `📖 *${d.title}*\n\n` +
            `📝 *Sinopsis*\n${d.synopsis.slice(0, 800)}...\n\n` +
            `📚 *Daftar Chapter*\n${ch}`
        },
        { quoted: m }
      )
    }

    /* ================= READ ================= */
    if (text.startsWith('read')) {
      const url = text.replace('read', '').trim()
      const c = await sakura.chapter(url)

      if (!c.text) return m.reply('❌ Chapter kosong')

      // Jika panjang → jadi file
      if (c.text.length > 3500) {
        const filePath = path.join(
          process.cwd(),
          `chapter-${Date.now()}.txt`
        )
        fs.writeFileSync(filePath, c.text)

        return conn.sendMessage(
          m.chat,
          {
            document: fs.readFileSync(filePath),
            mimetype: 'text/plain',
            fileName: 'sakura-chapter.txt'
          },
          { quoted: m }
        )
      }

      return m.reply(`📖 *Chapter*\n\n${c.text}`)
    }
  } catch (e) {
    m.reply('❌ Error:\n' + e.message)
  }
}

handler.command = ['sakura', 'sakuranovel', 'sn']
handler.tags = ['search']
handler.help = ['sn <judul>']

export default handler