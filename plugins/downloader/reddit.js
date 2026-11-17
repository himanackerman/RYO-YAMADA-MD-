import { download } from '../../lib/scrape/savefrom.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*Contoh: ${usedPrefix + command} https://www.reddit.com/r/...*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const data = await download(text.trim())

    if (!data.url || !data.url.length) {
      throw new Error('Media tidak ditemukan atau format tidak didukung.')
    }

    const title = data.meta?.title || data.id || 'Reddit Post'
    const duration = data.meta?.duration ? `${data.meta.duration}` : '-'
    const chosen = data.url.find(v => v.type === 'mp4' || v.ext === 'mp4' || v.url?.includes('.mp4')) || data.url[0]

    if (!chosen || !chosen.url) {
      throw new Error('URL download tidak ditemukan.')
    }

    const isVideo = chosen.type === 'mp4' || chosen.ext === 'mp4' || chosen.url?.includes('.mp4')

    let caption = `*\`Reddit Downloader\`*\n\n`
    caption += `✿ Judul : ${title}\n`
    if (duration !== '-') caption += `✿ Durasi : ${duration}\n`
    caption += `✿ Sumber : Reddit\n`

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: chosen.url },
        caption
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: chosen.url },
        caption
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(`*Gagal mengunduh konten Reddit 🍂*\n\n${e.message || e}`)
  }
}

handler.help = ['reddit <url>']
handler.tags = ['downloader']
handler.command = /^(reddit|redditdl)$/i
handler.limit = true

export default handler
