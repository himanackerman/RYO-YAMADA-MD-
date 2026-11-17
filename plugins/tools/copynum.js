let handler = async (m, { conn }) => {
  const target = m.mentionedJid?.[0] || m.sender
  const nomor = target.split('@')[0]

  await conn.sendMessage(m.chat, { text: nomor }, { quoted: m })
}

handler.help = ['copynum']
handler.tags = ['tools']
handler.command = /^copynum$/i

export default handler