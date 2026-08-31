import { downloadContentFromMessage } from 'baileys'

const CH_ID = '120363403952337689@newsletter'

async function streamToBuffer(stream) {
  let buffer = Buffer.from([])

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  return buffer
}

let handler = async (m, { conn }) => {

  const quoted =
    m.message?.extendedTextMessage
    ?.contextInfo
    ?.quotedMessage

  if (!quoted?.stickerMessage) {
    return m.reply('❌ Reply sticker!')
  }

  try {

    const stream = await downloadContentFromMessage(
      quoted.stickerMessage,
      'sticker'
    )

    const buffer = await streamToBuffer(stream)

    await conn.sendMessage(
      CH_ID,
      {
        sticker: buffer
      },
      {
        quoted: {
          key: {
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'Halo'
          },
          message: {
            conversation: '\u200e'
          }
        }
      }
    )

    m.reply('✅ Sticker berhasil dikirim ke channel!')

  } catch (e) {

    console.error(e)

    m.reply(
      `❌ Error\n\n${e.message || e}`
    )
  }
}

handler.help = ['upstik']
handler.tags = ['owner']
handler.command = /^(upstik|stickch)$/i
handler.owner = true

export default handler