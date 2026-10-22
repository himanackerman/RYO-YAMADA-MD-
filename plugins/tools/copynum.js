let handler = async (m, { conn }) => {
  const target = m.mentionedJid?.[0] || m.sender
  const nomor = target.split('@')[0]

  await new Button(conn)
    .setFooter(`Nomor: ${nomor}`)
    .addCopy(' Copy Nomor', nomor, { icon: 'DOCUMENT' })
    .send(m.chat, { quoted: m })
}

handler.help = ['copynum']
handler.tags = ['tools']
handler.command = /^copynum$/i

export default handler