let handler = async (m, { conn }) => {
  const number = global.owner[0][0]
  const name = global.owner[0][1]

  const vcard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `FN:${name}\n` +
    `ORG:${global.namebot};\n` +
    `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
    'END:VCARD'

  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: name,
        contacts: [{ vcard }]
      }
    },
    { quoted: m }
  )
}

handler.help = ['owner', 'infoowner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|infoowner|creator)$/i

export default handler