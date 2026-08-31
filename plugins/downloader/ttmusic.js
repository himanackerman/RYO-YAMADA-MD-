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
  await m.react('🎵')

  const input = m.quoted ? m.quoted.text : text

  if (!input) {
    return m.reply(
      `Contoh:\n` +
      `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
      `${usedPrefix + command} kurumi edit`
    )
  }

  try {
    let url = input

    if (!/^https?:\/\//i.test(input)) {
      url = await searchTikTok(input)
    }

    const res = await getTikTok(url)

    if (!res.music) {
      throw 'Audio TikTok tidak ditemukan'
    }

    const title = (res.title || '-').replace(/\s+/g, ' ').trim()
    const uploader = res.author?.nickname || res.author?.unique_id || '-'
    const duration = formatDuration(res.duration)

    const caption = `
— TIKTOK MUSIC —

❀ Judul : ${title.length > 80 ? title.slice(0, 80) + '...' : title}
❀ Uploader : ${uploader}
❀ Durasi : ${duration}
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: res.music },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      },
      { quoted: m }
    )

    await m.reply(caption)
    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    throw String(e)
  }
}

handler.help = ['tiktokmusic', 'ttmusic', 'ttmp3']
handler.tags = ['downloader']
handler.command = /^(tiktokmusic|ttmusic|ttmp3)$/i
handler.limit = true

export default handler

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}