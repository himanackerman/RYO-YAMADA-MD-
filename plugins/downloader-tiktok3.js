/*
 •  fitur : Tiktok Downloader
 • Type : Plugin ESM
 •  API : https://ttdl.siputzx.my.id
 */

import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!args[0]) return m.reply(`🍬 Masukkan link TikTok\nContoh: ${usedPrefix + command} https://vt.tiktok.com/xxxx`)

  try {
    const inputUrl = args[0]
    const apiBase = 'https://ttdl.siputzx.my.id'
    const apiUrl = `${apiBase}/api/download?url=${encodeURIComponent(inputUrl)}`
    const { data } = await axios.get(apiUrl, { timeout: 20000 })

    const d = data?.data || data

    const stats = d.stats || {
      views: d.views || '-',
      likes: d.likes || '-',
      shares: d.shares || '-',
      comments: d.comments || '-'
    }

    const authorName = d.author?.unique_id || d.author?.nickname || d.author?.name || '-'
    const title = d.title || d.description || d.caption || '-'

    const caption = `
✨ *TikTok Downloader*
🍭 Author : ${authorName}
🍬 Judul : ${title}

🥧 Views : ${stats.views}   🍕 Likes : ${stats.likes}
🍢 Shares : ${stats.shares}   🍬 Comments : ${stats.comments}
    `.trim()

    let videoUrl = d.video?.downloads?.normal?.url_local
      ? apiBase + d.video.downloads.normal.url_local
      : d.video?.downloads?.nowm?.url_local
        ? apiBase + d.video.downloads.nowm.url_local
        : d.video?.playUrl || d.video?.url || (typeof d.video === 'string' ? d.video : null)

    if (videoUrl) {
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m })
      if (d.music?.url) {
        await conn.sendMessage(m.chat, { audio: { url: d.music.url }, mimetype: 'audio/mpeg' }, { quoted: m })
      }
      return
    }

    if (Array.isArray(d.images) && d.images.length) {
      for (const img of d.images) {
        const imgUrl = img.url_original || img.url || img.src
        if (!imgUrl) continue
        await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption }, { quoted: m })
      }
      if (d.music?.url) {
        await conn.sendMessage(m.chat, { audio: { url: d.music.url }, mimetype: 'audio/mpeg' }, { quoted: m })
      }
      return
    }

    throw new Error('Tidak ada video ataupun gambar di respon API')

  } catch (err) {
    console.error(err)
    m.reply('🍬 Gagal mengambil atau mengirim media.\n' + (err.message || 'Unknown error'))
  }
}

handler.help = ["tiktok3 <url>"]
handler.command = ["tiktok3", "tt3", "ttdl3"]
handler.tags = ["downloader"]
handler.limit = false

export default handler