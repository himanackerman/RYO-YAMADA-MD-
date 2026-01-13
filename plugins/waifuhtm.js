/* 
hitamin waifu bisa pilih filter
type plugins esm
sumber : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
sumber scarape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3637

*/
import axios from 'axios'

const FILTERS = ['Coklat', 'Hitam', 'Nerd', 'Piggy', 'Carbon', 'Botak']

async function Hytamkan(imageUrl, filter = 'Hitam') {
  const selected = FILTERS.find(f => f.toLowerCase() === filter.toLowerCase())
  if (!selected) throw `Filter *${filter}* tidak tersedia.\n\nFilter tersedia:\n${FILTERS.join(', ')}`

  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const base64Input = Buffer.from(imgRes.data).toString('base64')

  const res = await axios.post('https://wpw.my.id/api/process-image', {
    imageData: base64Input,
    filter: selected.toLowerCase()
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://wpw.my.id',
      'Referer': 'https://wpw.my.id/',
    }
  })

  const dataUrl = res.data?.processedImageUrl
  if (!dataUrl?.startsWith('data:image/')) throw 'Gagal memproses gambar.'

  return dataUrl
}

let handler = async (m, { conn, args, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

  try {
    if (command == 'waifufilterlist') {
      const listText = `🎨 *Daftar Filter Penghitaman Waifu:*\n\n${FILTERS.map(f => `• ${f}`).join('\n')}

📌 *Cara pakai:*
1. Reply gambar waifu-nya
2. Ketik *.waifuhtm [filter]*

*Contoh:* .waifuhtm Hitam`

      await conn.reply(m.chat, listText, m)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
      return
    }

    if (!m.quoted) throw 'Reply gambar waifu-nya dulu bang!'
    if (!/image/.test(m.quoted.mimetype)) throw 'Yang direply harus gambar!'

    const filter = args[0] || 'Hitam'
    const media = await m.quoted.download()
    const url = `data:${m.quoted.mimetype};base64,${media.toString('base64')}`

    const result = await Hytamkan(url, filter)
    await conn.sendFile(m.chat, result, 'waifu.png', `✅ *Berhasil di-${filter} kan!*`, m)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ *Error:* ${e}`, m)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key }})
  }
}

handler.help = ['waifuhtm [filter]', 'waifufilterlist']
handler.tags = ['tools']
handler.command = /^(waifuhtm|waifufilterlist)$/i
handler.limit = true

export default handler