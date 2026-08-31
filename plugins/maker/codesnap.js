import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) return

  let url = `${global.APIs.faa}/faa/codesnap?text=${encodeURIComponent(text)}`
  let res = await fetch(url)

  if (!res.ok) return

  let buffer = Buffer.from(await res.arrayBuffer())

  await conn.sendFile(m.chat, buffer, 'codesnap.png', '', m)
}

handler.help = ['codesnap <code>']
handler.tags = ['maker']
handler.command = /^codesnap$/i
handler.limit = true

export default handler