import fs from 'fs'

let handler = async (m, { usedPrefix, command }) => {
  try {
    const quoted = m.quoted || m
    const mime = quoted?.mimetype || ''

    if (!mime.startsWith('image/')) {
      return m.reply(`Reply gambar dulu!\nContoh: reply foto lalu ketik *${usedPrefix + command}*`)
    }

    const buffer = await quoted.download()
    fs.writeFileSync('./media/ryo.jpg', buffer)
    global.thumb = buffer

    m.reply('✅ Thumbnail menu berhasil diupdate!')
  } catch (e) {
    console.error(e)
    m.reply('Error: ' + e.message)
  }
}

handler.help = ['setthumbmenu']
handler.tags = ['owner']
handler.command = /^setthumbmenu$/i
handler.owner = true

export default handler