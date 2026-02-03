import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) {
    return conn.reply(m.chat, '*Example :* .kbbi Anu', m)
  }

  let url = `${global.APIs.faa}/faa/kbbi?q=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.result) return

  let hasil = `
${json.result.kata}

${json.result.keterangan}
`.trim()

  conn.reply(m.chat, hasil, m)
}

handler.help = ['kbbi']
handler.tags = ['internet']
handler.command = /^kbbi$/i
handler.limit = true

export default handler