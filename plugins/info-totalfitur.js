import fs from 'fs'

let handler = async (m, { conn }) => {
  try {
    await m.react('🕒')

    let totalFitur = Object.values(global.plugins)
      .filter(v => v.help && v.tags && !v.disabled)
      .length

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

    await conn.sendMessage(
      m.chat,
      { text: caption },
      { quoted: global.fkontak || m }
    )

    await conn.sendFile(
      m.chat,
      './media/tes2.mp3',
      'menu.mp3',
      null,
      global.fkontak || m,
      true,
      {
        type: 'audioMessage',
        ptt: true,
        seconds: 0
      }
    )

  } catch (e) {
    m.reply('Terjadi error.')
  }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

export default handler