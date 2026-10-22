let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} renz|mark`

  let [name1, name2] = text.split('|').map(v => v.trim())

  if (!name1 || !name2) throw `Contoh: ${usedPrefix + command} renzytta|mark`

  await m.react('🕒')

  let url = `https://apiii-xrina.my.id/canvas/fakeffduo?name1=${encodeURIComponent(name1)}&name2=${encodeURIComponent(name2)}`

  let res = await fetch(url)
  if (!res.ok) throw `API Error: ${res.status}`

  let buffer = Buffer.from(await res.arrayBuffer())

  await conn.sendMessage(m.chat, {
    image: buffer
  }, { quoted: m })
}

handler.help = ['fakeffduo']
handler.tags = ['maker']
handler.command = /^fakeffduo$/i
handler.limit = false

export default handler