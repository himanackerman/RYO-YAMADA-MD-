import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  await m.react('✨')

  let url = `${global.APIs.faa}/faa/papayang`
  let res = await fetch(url)

  if (!res.ok) return

  let buffer = Buffer.from(await res.arrayBuffer())

  await conn.sendFile(m.chat, buffer, 'papayang.jpg', '', m)
}

handler.help = ['papayang']
handler.tags = ['random']
handler.command = /^papayang$/i
handler.limit = true

export default handler