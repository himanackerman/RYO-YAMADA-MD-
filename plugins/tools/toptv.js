import { downloadContentFromMessage } from 'baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || ''

  if (!mime.startsWith('video/')) {
    return m.reply(`❌ Balas video dengan perintah *${usedPrefix + command}*`)
  }

  try {
    await m.react('🕒')

    const stream = await downloadContentFromMessage(
      quoted.msg || quoted,
      'video'
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    await conn.sendMessage(m.chat, {
      video: buffer,
      ptv: true
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ Terjadi kesalahan: ${e.message}`)
  }
}

handler.help = ['toptv']
handler.tags = ['tools']
handler.command = /^(toptv|tovideonote|topvn)$/i
handler.limit = true

export default handler