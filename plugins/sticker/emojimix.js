import axios from 'axios'
import { sticker } from '../../lib/sticker.js'

let metadataCache = null
let metadataExpiry = 0
const CACHE_TTL = 3600000

async function getMetadata() {
  if (metadataCache && Date.now() < metadataExpiry) return metadataCache
  const res = await axios.get('https://raw.githubusercontent.com/xsalazar/emoji-kitchen-backend/main/app/metadata.json', { timeout: 15000 })
  metadataCache = res.data
  metadataExpiry = Date.now() + CACHE_TTL
  return metadataCache
}

function toCodepoint(emoji) {
  const codes = []
  for (const char of emoji) {
    const cp = char.codePointAt(0).toString(16)
    if (cp !== 'fe0f') codes.push(cp)
  }
  return codes.join('-')
}

async function emojiKitchen(emoji1, emoji2) {
  const metadata = await getMetadata()
  const data = metadata.data || {}

  const cp1 = toCodepoint(emoji1)
  const cp2 = toCodepoint(emoji2)

  let result = null
  const leftData = data[cp1]
  if (leftData && leftData.combinations && leftData.combinations[cp2]) {
    const combos = leftData.combinations[cp2]
    result = combos[combos.length - 1]
  }

  if (!result) {
    const leftData2 = data[cp2]
    if (leftData2 && leftData2.combinations && leftData2.combinations[cp1]) {
      const combos = leftData2.combinations[cp1]
      result = combos[combos.length - 1]
    }
  }

  if (!result) {
    throw new Error(`Kombinasi emoji ${emoji1} + ${emoji2} tidak ditemukan.`)
  }

  return result.gStaticUrl
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `— emoji mix —\n\n` +
      `❀ usage : ${usedPrefix + command} <emoji1> <emoji2>\n` +
      `❀ example : ${usedPrefix + command} 😂 ❤️`
    )
  }

  const emojis = text.trim().split(/\s+/)
  if (emojis.length < 2) {
    return m.reply(`Harap masukkan dua emoji terpisah spasi, contoh: *${usedPrefix + command} 😂 ❤️*`)
  }

  await m.react('🕒')

  try {
    const imageUrl = await emojiKitchen(emojis[0], emojis[1])
    const stiker = await sticker(false, imageUrl, global.stickpack || 'Emoji Mix', global.author || 'Bot')

    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else {
      throw new Error('Gagal mengonversi gambar menjadi stiker.')
    }

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ ${typeof e === 'string' ? e : (e.message || 'Terjadi kesalahan.')}`)
  }
}

handler.help = ['emojimix']
handler.tags = ['sticker']
handler.command = /^(emojimix|emix)$/i
handler.limit = false
handler.register = false

export default handler