import os from 'os'

let handler = async (m, { conn }) => {
  try {
    let uptime = process.uptime()
    let hours = Math.floor(uptime / 3600)
    let minutes = Math.floor((uptime % 3600) / 60)
    let seconds = Math.floor(uptime % 60)

    let caption = `
⏱ *Runtime Bot*
${hours} jam ${minutes} menit ${seconds} detik

🖥 *System*
OS      : ${os.platform()}
Arch    : ${os.arch()}
RAM     : ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB
`.trim()

    await conn.sendMessage(
      m.chat,
      { text: caption },
      { quoted: global.fkontak || m }
    )

  } catch (e) {
    m.reply('Terjadi error.')
  }
}

handler.help = ['runtime']
handler.tags = ['info']
handler.command = ['runtime']

export default handler