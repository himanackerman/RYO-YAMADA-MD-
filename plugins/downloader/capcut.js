let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh:
.capcut https://www.capcut.com/tv2/ZSC3H1kDM/`

  await m.react('🕒')

  try {
    const res = await fetch(`${global.APIs.nexray}/downloader/capcut?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status) throw new Error(json.message || 'Gagal mengambil video.')

    const data = json.result

    const head = await fetch(data.url, { method: 'HEAD' })
    const size = Number(head.headers.get('content-length') || 0)
    const isLarge = size > 50 * 1024 * 1024

    const caption = `❏ Author      : ${data.author || '-'}
❏ Title       : ${data.title || '-'}`

    if (isLarge) {
      await conn.sendMessage(m.chat, {
        document: { url: data.url },
        fileName: `${data.title || 'capcut'}.mp4`,
        mimetype: 'video/mp4',
        caption
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: data.url },
        caption
      }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || 'Terjadi kesalahan.'
  }
}

handler.help = ['capcut']
handler.tags = ['downloader']
handler.command = /^capcut$/i
handler.limit = true

export default handler