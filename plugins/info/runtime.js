import os from 'os'
import fs from 'fs'

let handler = async (m, { conn }) => {
try {
let uptime = process.uptime()
let hours = Math.floor(uptime / 3600)
let minutes = Math.floor((uptime % 3600) / 60)
let seconds = Math.floor(uptime % 60)

await conn.sendMessage(m.chat, {
  orderText: `🌷 Runtime Bot

❏ Runtime : ${hours} Jam ${minutes} Menit ${seconds} Detik

❏ System : ${os.platform()}
❏ Arch : ${os.arch()}
❏ RAM : ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB

✨ Ryo Yamada MD`,
thumbnail: fs.readFileSync('./media/thumbnail.jpg')
}, {
quoted: m
})

} catch (e) {
m.reply('🌷 Terjadi kesalahan saat mengambil data runtime.')
}
}

handler.help = ['runtime']
handler.tags = ['info']
handler.command = ['runtime']

export default handler