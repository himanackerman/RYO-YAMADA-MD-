import axios from 'axios'
import { download } from '../../lib/scrape/savefrom.js'

async function getToken() {
  const url = 'https://fbdownloader.to/id'
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  })

  const regex = /k_exp="(.*?)".*?k_token="(.*?)"/s
  const match = html.match(regex)
  if (!match) throw new Error('Token tidak ditemukan')

  return {
    k_exp: match[1],
    k_token: match[2]
  }
}

async function fbDownloader(fbUrl) {
  const { k_exp, k_token } = await getToken()

  const payload = new URLSearchParams({
    k_exp,
    k_token,
    p: 'home',
    q: fbUrl,
    lang: 'id',
    v: 'v2',
    W: ''
  })

  const { data } = await axios.post('https://fbdownloader.to/api/ajaxSearch', payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://fbdownloader.to',
      'Referer': 'https://fbdownloader.to/id'
    }
  })

  if (!data || !data.data) throw new Error('Gagal mengambil data video dari FBDownloader')

  const html = data.data
  const results = []

  const rowRegex = /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g
  let match
  while ((match = rowRegex.exec(html)) !== null) {
    const quality = match[1].trim()
    const url = match[2] || match[3]
    if (quality && url) results.push({ quality, url })
  }

  return results
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*Contoh: ${usedPrefix + command} https://facebook.com/...*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let videoData = null

    try {
      const sf = await download(text.trim())
      const chosen = sf.url?.find(v => v.subname === 'HD' || v.type === 'mp4' || v.ext === 'mp4') || sf.url?.[0]
      if (chosen && chosen.url) {
        videoData = {
          title: sf.meta?.title || sf.id || 'Facebook Video',
          duration: sf.meta?.duration || '-',
          quality: chosen.subname || chosen.name || 'HD',
          url: chosen.url
        }
      }
    } catch {}

    if (!videoData) {
      const results = await fbDownloader(text.trim())
      if (!results.length) throw new Error('Tidak ada video ditemukan.')
      videoData = {
        title: 'Facebook Video',
        duration: '-',
        quality: results[0].quality || 'HD',
        url: results[0].url
      }
    }

    let caption = `*\`Facebook Downloader\`*\n\n`
    caption += `✿ Judul : ${videoData.title}\n`
    caption += `✿ Durasi : ${videoData.duration}\n`
    caption += `✿ Kualitas : ${videoData.quality}\n`

    await conn.sendMessage(m.chat, {
      video: { url: videoData.url },
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(`*Gagal mengunduh video Facebook 🍂*\n\n${e.message || e}`)
  }
}

handler.help = ['facebook <url>']
handler.tags = ['downloader']
handler.command = /^fb|facebook$/i
handler.limit = true

export default handler
