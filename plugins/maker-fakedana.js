import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} 5000000`

  let nominal = text.replace(/[^0-9]/g, '')
  if (!nominal) throw `Nominal harus angka.`

  let url = `https://api.zenzxz.my.id/maker/fakedana?nominal=${nominal}`

  let { data } = await axios.get(url, { responseType: 'arraybuffer' })
  let buffer = Buffer.from(data)

  await conn.sendMessage(m.chat, {
    image: buffer
  }, { quoted: global.fstatus })
}

handler.help = ['fakedana <nominal>']
handler.tags = ['maker']
handler.command = /^fakedana$/i
handler.limit = true

export default handler