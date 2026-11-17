import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*Contoh penggunaan:*\n\n` +
      `Ketik:\n` +
      `*${usedPrefix + command} <teks>*\n` +
      `atau dengan memilih template (1-4):\n` +
      `*${usedPrefix + command} <teks> | <nomor template>*\n\n` +
      `*Contoh:* ${usedPrefix + command} Just friend kok cemburuan | 1`
    )
  }

  const parts = text.split('|').map(v => v.trim())
  let inputText = parts[0]
  let template = '1'

  if (parts.length >= 2 && /^[0-9]+$/.test(parts[1])) {
    template = parts[1]
  } else if (/^[0-9]+$/.test(parts[0]) && parts[1]) {
    template = parts[0]
    inputText = parts[1]
  }

  await m.react('🕒')

  try {
    const apiUrl = `${global.APIs.xrina}/canvas/derydnta?text=${encodeURIComponent(inputText)}&template=${encodeURIComponent(template)}`

    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!response.data) throw 'Gagal memproses gambar Derydnta.'

    const caption = `*\`DERYDNTA CANVAS\`*\n\n` +
      `✿ Template : ${template}\n` +
      `✿ Status : Berhasil dibuat`

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error('Error Derydnta Canvas:', e)
    await m.react('❌')
    throw e?.message || String(e)
  }
}

handler.help = ['derydnta <teks>', 'derydnta <teks> | <template>']
handler.tags = ['maker']
handler.command = /^(derydnta|dery)$/i
handler.limit = true

export default handler
