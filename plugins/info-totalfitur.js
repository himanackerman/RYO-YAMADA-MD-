import fs from 'fs'

let handler = async (m, { conn }) => {
  await m.react('🕒')

  let totalFitur = Object.values(global.plugins).filter(v => v.help && v.tags).length
  let totalCommand = Object.values(global.plugins)
    .map(v => v.command)
    .filter(v => v)
    .map(v => Array.isArray(v) ? v.length : 1)
    .reduce((a, b) => a + b, 0)

  await m.react('✅')

  let caption = `
🔧 *Total Fitur:* ${totalFitur}
📖 *Total Command:* ${totalCommand}
`.trim()

  let thumbnail = fs.readFileSync('./media/thumbnail.jpg')

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: "Ryo Yamada MD",
        body: "Bot Status",
        thumbnail,
        mediaType: 1,
        renderLargerThumbnail: true,
       // sourceUrl: "https://youtube.com/@hilmanxd"
      }
    }
  }, { quoted: m })

  try {
    await conn.sendFile(
      m.chat,
      './media/tes2.mp3',
      'menu.mp3',
      null,
      m,
      true,
      {
        type: 'audioMessage',
        ptt: true,
        seconds: 0
      }
    )
  } catch {}
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

export default handler