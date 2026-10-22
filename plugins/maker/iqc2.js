let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} Halo hilman
${usedPrefix + command} Halo hilman|INDOSAT|15:55|55`)
  }

  const args = text.split('|').map(v => v.trim())

  const teks = args[0]
  if (!teks) return m.reply('Masukkan teks.')

  const now = new Date()
  const jamDefault = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const provider = (args[1] || 'INDOSAT').toUpperCase()
  const jam = args[2] || jamDefault
  const baterai = args[3] || '100'

  const url =
    `${global.APIs.nexray}/maker/v1/iqc?` +
    `text=${encodeURIComponent(teks)}` +
    `&provider=${encodeURIComponent(provider)}` +
    `&jam=${encodeURIComponent(jam)}` +
    `&baterai=${encodeURIComponent(baterai)}`

  const caption = `— *IQC MAKER* —

❀ *Text* : ${teks}
❀ *Provider* : ${provider}
❀ *Time* : ${jam}
❀ *Battery* : ${baterai}%`

  await conn.sendMessage(
    m.chat,
    {
      image: { url },
      caption
    },
    { quoted: m }
  )
}

handler.help = ['iqc2']
handler.tags = ['maker']
handler.command = /^iqc2$/i
handler.limit = true
handler.register = true

export default handler