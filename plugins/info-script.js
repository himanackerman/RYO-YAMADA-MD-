import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let res = await fetch('https://files.catbox.moe/hjnj00.webp')
  let buffer = await res.buffer()

  await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.command = /^(sc|script)$/i
handler.tags = ['info']
export default handler