/*• Nama Fitur : Cewek Brat
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbB8WYS4CrfhJCelw33j
*/


import axios from 'axios'
import { Sticker } from 'wa-sticker-formatter'

async function Brats(text) {
  const { data } = await axios.get(
    `https://api.deline.my.id/maker/cewekbrat?text=${encodeURIComponent(text)}`,
    { responseType: 'arraybuffer', timeout: 120000 }
  )
  return Buffer.from(data)
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh penggunaan:\n${usedPrefix + command} agas`

  await conn.sendMessage(m.chat, { text: 'Sedang memproses...' }, { quoted: m })

  const img = await Brats(text)
  const sticker = new Sticker(img, {
    pack: 'Deline Clarissa',
    author: 'Agas'
  })
  const buf = await sticker.toBuffer()

  await conn.sendMessage(m.chat, { sticker: buf }, { quoted: m })
}

handler.help = ['cewekbrat']
handler.tags = ['sticker']
handler.command = ['cewekbrat']
handler.register = true
handler.limit = true

export default handler