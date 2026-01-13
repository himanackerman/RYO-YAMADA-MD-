// Threads downloader
// API : https://rynekoo-api.hf.space
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply('Masukkan link Threads\n\nContoh:\n.threads https://www.threads.com/xxxxx')
  }

  try {
    let input = encodeURIComponent(args[0])
    let api = `https://rynekoo-api.hf.space/downloader/threads?url=${input}`

    let res = await fetch(api)
    let json = await res.json()

    if (!json.success || !json.result) {
      throw 'Data tidak valid'
    }

    let result = json.result
    let caption = (result.text || result.caption || '').trim()

    let videos = []
    if (Array.isArray(result.videos)) {
      videos = result.videos.flat().filter(v => v?.url)
    }

    let images = []
    if (Array.isArray(result.images)) {
      images = result.images.flat().filter(i => i?.url)
    }

    if (videos.length > 0) {
      let video = videos[0]

      await conn.sendMessage(m.chat, {
        video: { url: video.url },
        caption
      }, { quoted: m })

      return
    }

    if (images.length > 0) {
      for (let img of images) {
        await conn.sendMessage(m.chat, {
          image: { url: img.url },
          caption
        }, { quoted: m })
      }
      return
    }

    m.reply('Tidak ditemukan media')

  } catch (err) {
    console.error(err)
    m.reply('Gagal mengambil media Threads')
  }
}

handler.help = ['threads <url>']
handler.tags = ['downloader']
handler.command = /^threads$/i
handler.limit = true

export default handler