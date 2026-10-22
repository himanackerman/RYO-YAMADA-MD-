import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      `Example : ${usedPrefix + command} https://vt.tiktok.com/xxxx`,
      m
    )
  }

  try {
    let api = `${global.APIs.faa}/faa/aio?url=${encodeURIComponent(text)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) throw 'Gagal mengambil data.'

    let data = json.result
    let videoUrl = data.download_url

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: data.title || 'Video berhasil diunduh'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Gagal mengambil video.', m)
  }
}

handler.help = ['aio2 <url>']
handler.tags = ['downloader']
handler.command = /^aio2$/i
handler.limit = true

export default handler