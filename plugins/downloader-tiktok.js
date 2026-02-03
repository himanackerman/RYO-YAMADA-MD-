import axios from 'axios'

async function searchTikTok(query) {
  const { data } = await axios.get(
    'https://tikwm.com/api/feed/search',
    {
      params: {
        keywords: query,
        count: 1
      },
      timeout: 20000
    }
  )

  if (!data || data.code !== 0 || !data.data?.videos?.length) {
    throw 'Hasil tidak ditemukan'
  }

  const v = data.data.videos[0]
  return `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`
}

async function getTikTok(url) {
  const { data } = await axios.get(
    'https://tikwm.com/api/',
    {
      params: { url, hd: 1 },
      timeout: 20000
    }
  )

  if (!data || data.code !== 0) {
    throw 'Gagal mengambil data TikTok'
  }

  return data.data
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  const input = m.quoted ? m.quoted.text : text
  if (!input) {
    return m.reply(
      `Contoh:\n` +
      `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
      `${usedPrefix + command} elaina edit`
    )
  }

  try {
    let url = input

    if (!/^https?:\/\//i.test(input)) {
      url = await searchTikTok(input)
    }

    const res = await getTikTok(url)

    const title = res.title || '-'
    const uploader = res.author?.nickname || res.author?.unique_id || '-'
    const duration = formatDuration(res.duration)
    const views = formatNumber(res.play_count || res.play || res.views || 0)

    const caption = `
# *TIKTOK VIDEO*

> *Judul*: ${title}
> *Uploader*: ${uploader}
> *Durasi*: ${duration}
> *Views*: ${views}
    `.trim()

    if (Array.isArray(res.images) && res.images.length > 0) {
      let total = res.images.length
      let index = 1

      for (const img of res.images) {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: img },
            caption: `${caption}\n\n> *Slide*: ${index} / ${total}`
          },
          { quoted: m }
        )
        index++
      }

      if (res.music) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: res.music },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      }

      await m.react('✅')
      return
    }

    if (res.play) {
      await conn.sendMessage(
        m.chat,
        {
          video: { url: res.play },
          caption
        },
        { quoted: m }
      )
    }

    if (res.music) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: res.music },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw String(e)
  }
}

handler.help = ['tt', 'tiktok']
handler.tags = ['downloader']
handler.command = /^(tt|tiktok)$/i
handler.limit = true
handler.register = true

export default handler

function formatNumber(num = 0) {
  return num.toLocaleString()
}

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}