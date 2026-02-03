import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  await m.react('✨')

  if (!text) return

  let url = `${global.APIs.faa}/faa/doa?q=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data?.length) return

  let hasil = json.data.map(d => `
${d.doa}

${d.ayat}

${d.latin}

${d.artinya}
`.trim()).join('\n\n')

  conn.reply(m.chat, hasil, m)
}

handler.help = ['doa <kata kunci>']
handler.tags = ['internet']
handler.command = /^doa$/i
handler.limit = true

export default handler