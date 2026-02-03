import axios from 'axios'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  try {
    let input = args[0] || text || m.quoted?.text || ''
    let urlMatch = input.match(/https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/i)
    let igUrl = urlMatch ? urlMatch[0] : null

    if (!igUrl) {
      return m.reply(
        `Kirim link Instagram atau reply link.\n\nContoh:\n${usedPrefix + command} https://www.instagram.com/reel/xxxxxx/`
      )
    }

    let api = `https://anabot.my.id/api/download/instagram?url=${encodeURIComponent(igUrl)}&apikey=freeApikey`
    let { data } = await axios.get(api, { headers: { accept: '*/*' } })

    if (!data.success) {
      throw new Error(data.message || 'Gagal memproses API.')
    }

    let hasil = data.data?.result
    if (!Array.isArray(hasil) || !hasil.length) {
      throw new Error('Media tidak ditemukan.')
    }

    let caption = `✨ *Instagram Downloader*\n\nBerhasil mengunduh ${hasil.length} media.`

    for (let media of hasil) {
      let link = media.url
      if (!link) continue

      let isVideo =
        link.includes('.mp4') ||
        media.filename?.includes('.mp4')

      await conn.sendFile(
        m.chat,
        link,
        isVideo ? 'video.mp4' : 'image.jpg',
        caption,
        m
      )

      caption = '' // caption hanya muncul sekali
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error:\n${e.message}`)
  }
}

handler.help = ['ig <url>', 'instagram <url>']
handler.tags = ['downloader']
handler.command = /^(ig|instagram)$/i
handler.limit = true

export default handler