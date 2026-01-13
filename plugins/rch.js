/*• Nama Fitur : reactch 
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbBt4432f3ENa8ULoM1J
• Author : Z7
• Note : di web https://asitha.top/channel-manager
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  if (args.length < 2)
    return m.reply(
      "Format:\n" +
      "rch <link> <emoji1> <emoji2> ...\n\n" +
      "Contoh:\n" +
      "rch https://whatsapp.com/channel/xxxx 😂 😭 🔥"
    )

  const link = args.shift()

  let emojiList = args
    .join(" ")
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(e => e.trim())

  const emoji = emojiList.join(",")
  const apiKey = "" // api key dari https://asitha.top/channel-manager

  try {
    const url = `https://react.whyux-xec.my.id/api/rch?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emoji)}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    })

    const json = await res.json()
    m.reply(JSON.stringify(json, null, 2))
  } catch (e) {
    m.reply("❌ Error saat mengambil data API!")
  }
}

handler.help = ['rch <link> <emoji...>', 'react <link> <emoji...>']
handler.tags = ['owner']
handler.command = /^(rch|react)$/i
handler.owner = true

export default handler