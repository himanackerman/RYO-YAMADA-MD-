import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(
      m.chat,
      '*Example :* .gptprompt Seolah kamu Ryo Yamada | Halo',
      m
    )
  }

  let [prompt, isi] = text.split('|').map(v => v.trim())
  if (!prompt || !isi) {
    return conn.reply(
      m.chat,
      '*Example :* .gptprompt Seolah kamu Ryo Yamada | Halo',
      m
    )
  }

  let url = `${global.APIs.faa}/faa/gpt-promt?prompt=${encodeURIComponent(prompt)}&text=${encodeURIComponent(isi)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.result.trim(), m)
}

handler.help = ['gptprompt']
handler.tags = ['ai']
handler.command = /^gptprompt$/i
handler.limit = true

export default handler