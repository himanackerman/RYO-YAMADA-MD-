/*
fitur : InstaTiktok download 
desk : support fb,ig,tiktok
source scarape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3951
*/

import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (args.length < 2) return m.reply(`Contoh:\n${usedPrefix + command} tiktok https://vt.tiktok.com/ZSBKKk4HS/`)

  const platform = args[0].toLowerCase()
  const inputUrl = args[1]

  if (!['instagram', 'tiktok', 'facebook'].includes(platform))
    return m.reply('Platform tidak valid! Gunakan: instagram, tiktok, atau facebook')

  const SITE_URL = 'https://instatiktok.com/'
  const form = new URLSearchParams()
  form.append('url', inputUrl)
  form.append('platform', platform)
  form.append('siteurl', SITE_URL)

  try {
    const res = await axios.post(`${SITE_URL}api`, form.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': SITE_URL,
        'Referer': SITE_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    const html = res?.data?.html
    if (!html || res?.data?.status !== 'success') throw 'Gagal ambil data'

    const $ = cheerio.load(html)
    const links = []

    $('a.btn[href^="http"]').each((_, el) => {
      const link = $(el).attr('href')
      if (link && !links.includes(link)) links.push(link)
    })

    if (links.length === 0) throw 'Link download tidak ditemukan'

    let download
    if (platform === 'instagram') {
      download = links
    } else if (platform === 'tiktok') {
      download = links.find(link => /hdplay/.test(link)) || links[0]
    } else if (platform === 'facebook') {
      download = links.at(-1)
    }

    if (Array.isArray(download)) {
      for (let link of download) {
        await conn.sendFile(m.chat, link, 'media.mp4', `✅ Hasil download dari ${platform}`, m)
      }
    } else {
      await conn.sendFile(m.chat, download, 'media.mp4', `✅ Berhasil download dari ${platform}`, m)
    }

  } catch (e) {
    m.reply(`❌ Gagal: ${e.message || e}`)
  }
}

handler.help = ['dlit <platform> <url>']
handler.tags = ['downloader']
handler.command = /^dlit$/i
handler.limit = true

export default handler