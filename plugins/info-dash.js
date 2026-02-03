let handler = async (m, { conn }) => {
  let stats = Object.entries(db.data.stats).map(([key, val]) => {
    let help = plugins[key]?.help
    let name = Array.isArray(help) ? help.join(', ') : help || key
    if (/exec/.test(name)) return null // kasih null biar bisa di filter
    return { name, ...val }
  }).filter(v => v) // buang null hasil exec

  stats = stats.sort((a, b) => b.total - a.total)

  let handlers = stats.slice(0, 100).map(({ name, total }) => {
    return `乂 *Command* : *${name}*\n• *Global HIT* : ${total}`
  }).join`\n\n` || 'Belum ada statistik penggunaan.'

  await conn.relayMessage(m.chat, {
    extendedTextMessage: {
      text: handlers,
      contextInfo: {
        externalAdReply: {
          title: '',
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: 'https://telegra.ph/file/c43ee155efc11b774bee3.jpg',
          sourceUrl: ''
        }
      },
      mentions: [m.sender]
    }
  }, {})
}

handler.help = ['dashboard']
handler.tags = ['main']
handler.command = /^(dashboard)$/i

export default handler