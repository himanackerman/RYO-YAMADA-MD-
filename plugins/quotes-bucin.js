import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  await m.react('✨')

  let url = `${global.APIs.faa}/faa/quote-bucin`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status) return

  conn.reply(m.chat, json.quote.trim(), m)
}

handler.help = ['quotebucin']
handler.tags = ['quotes']
handler.command = /^quotebucin$/i
handler.limit = true

export default handler