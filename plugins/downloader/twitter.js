import { download } from '../../lib/scrape/savefrom.js'

async function scrapeSaveTwitter(url) {
  const body = new URLSearchParams({
    q: url,
    lang: 'id',
    cftoken: ''
  })

  const res = await fetch('https://savetwitter.net/api/ajaxSearch', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://savetwitter.net',
      'Referer': 'https://savetwitter.net/id3'
    },
    body
  })

  const json = await res.json()
  const html = json?.data
  if (!html) throw new Error('Gagal mengambil data video dari SaveTwitter.')

  const title = html.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || 'Twitter Video'
  const duration = html.match(/<p>(\d+:\d+)<\/p>/)?.[1] || '-'
  const thumbnail = html.match(/<img src="([^"]+)"/)?.[1] || null

  const mp4 = [...html.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g)]
    .map(v => ({
      quality: v[2],
      url: v[1]
    }))

  if (!mp4.length) throw new Error('Video tidak ditemukan di SaveTwitter.')

  return {
    title,
    duration,
    quality: mp4[0].quality,
    url: mp4[0].url,
    thumbnail
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*Contoh: ${usedPrefix + command} https://x.com/...*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    let videoData = null

    try {
      const sf = await download(text.trim())
      const chosen = sf.url?.find(v => v.type === 'mp4' || v.ext === 'mp4' || v.url?.includes('.mp4')) || sf.url?.[0]
      if (chosen && chosen.url) {
        videoData = {
          title: sf.meta?.title || 'Twitter Video',
          duration: sf.meta?.duration || '-',
          quality: chosen.subname || chosen.name || 'HD',
          url: chosen.url,
          thumbnail: sf.thumb || null
        }
      }
    } catch {}

    if (!videoData) {
      videoData = await scrapeSaveTwitter(text.trim())
    }

    let caption = `*\`Twitter Downloader\`*\n\n`
    caption += `✿ Judul : ${videoData.title}\n`
    caption += `✿ Durasi : ${videoData.duration}\n`
    caption += `✿ Kualitas : ${videoData.quality}\n`

    let jpegThumbnail = null
    if (videoData.thumbnail) {
      try {
        const thRes = await fetch(videoData.thumbnail)
        jpegThumbnail = Buffer.from(await thRes.arrayBuffer())
      } catch {}
    }

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoData.url },
        caption,
        ...(jpegThumbnail ? { jpegThumbnail } : {})
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(`*Terjadi kesalahan saat memproses video 🍂*\n\n${e.message || e}`)
  }
}

handler.help = ['twitter <url>']
handler.tags = ['downloader']
handler.command = /^(twitter|tw|xdl)$/i
handler.limit = true

export default handler
