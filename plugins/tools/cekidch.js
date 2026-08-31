const handler = async (m, { conn, text, command, isOwner }) => {
  try {
    await m.react('🆔')

    if (/^(cekidgc|cekidgrup)$/i.test(command)) {
      if (!isOwner) return m.reply('❌ Khusus owner.')
      if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa dipakai di grup.')

      let id = m.chat

      return await conn.sendMessage(m.chat, {
        text: `✨ *ID Grup:*\n${id}`,
        nativeFlow: [
          {
            text: '✨ Salin ID',
            copy: id
          }
        ]
      }, { quoted: m })
    }

    if (/^(cekidch|idch)$/i.test(command)) {
      if (!text) {
        return m.reply('❌ Masukkan link channel WhatsApp.')
      }

      if (!text.includes('https://whatsapp.com/channel/')) {
        return m.reply('❌ Link channel tidak valid.')
      }

      let result = text.split('https://whatsapp.com/channel/')[1].split('?')[0].trim()

      let res = await conn.newsletterMetadata('invite', result).catch(() => null)

      let id = res?.id || result + '@newsletter'

      return await conn.sendMessage(m.chat, {
        text: `✨ *ID Channel:*\n${id}`,
        nativeFlow: [
          {
            text: '✨ Salin ID',
            copy: id
          }
        ]
      }, { quoted: m })
    }

  } catch (e) {
    console.log(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['cekidgc', 'cekidgrup', 'cekidch', 'idch']
handler.tags = ['tools']
handler.command = /^(cekidgc|cekidgrup|cekidch|idch)$/i
handler.limit = false

export default handler