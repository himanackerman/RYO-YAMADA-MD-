let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:
.aio https://vm.tiktok.com/ZSXwf1TAm/`

  await m.react('🕒')

  try {
    const res = await fetch(`${global.APIs.nexray}/downloader/aio?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status) throw new Error(json.message || 'Gagal mengambil media.')

    const data = json.result

    const media =
      data.medias.find(v => v.type === 'video' && v.quality === 'hd_no_watermark') ||
      data.medias.find(v => v.type === 'video') ||
      data.medias.find(v => v.type === 'audio')

    if (!media) throw 'Media tidak ditemukan.'

    if (media.type === 'audio') {
      await conn.sendMessage(m.chat, {
        audio: { url: media.url },
        mimetype: 'audio/mpeg',
        fileName: `${data.title || 'audio'}.mp3`,
        ptt: false
      }, { quoted: m })
    } else {
      const size = media.data_size || 0
      const isLarge = size > 50 * 1024 * 1024

      const caption = `❏ Author      : ${data.author || '-'}
❏ Duration    : ${Math.floor((data.duration || 0) / 1000)} Detik
❏ Title       : ${data.title || '-'}`

      if (isLarge) {
        await conn.sendMessage(m.chat, {
          document: { url: media.url },
          fileName: `${data.title || 'video'}.mp4`,
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: media.url },
          caption
        }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || 'Terjadi kesalahan.'
  }
}

handler.help = ['aio']
handler.tags = ['downloader']
handler.command = /^aio$/i
handler.limit = true

export default handler