let handler = async (m, { conn }) => {
  await m.reply('🔄 Merestart bot...')

  try {
    if (global.db?.data) {
      global.db.data.restartInfo = { chat: m.chat, time: Date.now() }
      await global.db.write()
    }
  } catch (e) {
    console.error('Gagal simpan database sebelum restart:', e)
  }

  setTimeout(() => {
    if (process.send) process.send('reset')
    else process.exit(0)
  }, 1500)
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(restart|reboot)$/i
handler.rowner = true

export default handler