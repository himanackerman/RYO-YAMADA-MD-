import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .gimg Ryo Yamada', m)
  }

  let url = `${global.APIs.faa}/faa/google-image?query=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result?.length) return

  for (let img of json.result.slice(0, 5)) {
    await conn.sendFile(m.chat, img, 'image.jpg', '', m)
  }
}

handler.help = ['gimg']
handler.tags = ['internet']
handler.command = /^gimg$/i
handler.limit = true

export default handler