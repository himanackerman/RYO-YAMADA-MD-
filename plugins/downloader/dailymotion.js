import { download } from '../../lib/scrape/savefrom.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*Contoh: ${usedPrefix + command} https://www.dailymotion.com/video/x7tgad0*`)
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const data = await download(text.trim())

    if (!data.url || !data.url.length) {
      throw new Error('Media tidak ditemukan atau format tidak didukung.')
    }

    const title = data.meta?.title || data.id || 'Dailymotion Video'
    const duration = data.meta?.duration ? `${data.meta.duration}` : '-'
    const chosen = data.url.find(v => v.type === 'mp4' || v.ext === 'mp4' || v.url?.includes('.mp4')) || data.url[0]

    if (!chosen || !chosen.url) {
      throw new Error('URL download tidak ditemukan.')
    }

    const quality = chosen.subname || chosen.name || '720p'

    let caption = `*\`Dailymotion Downloader\`*\n\n`
    caption += `✿ Judul : ${title}\n`
    caption += `✿ Durasi : ${duration}\n`
    caption += `✿ Kualitas : ${quality}\n`

    await conn.sendMessage(m.chat, {
      video: { url: chosen.url },
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await m.reply(`*Gagal mengunduh video Dailymotion 🍂*\n\n${e.message || e}`)
  }
}

handler.help = ['dailymotion <url>']
handler.tags = ['downloader']
handler.command = /^(dailymotion|dm|dmdl)$/i
handler.limit = true

export default handler
