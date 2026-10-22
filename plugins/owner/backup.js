import fs from 'fs'
import archiver from 'archiver'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    const tmpDir = './tmp'
    const tmpFile = path.join(tmpDir, 'ryo.tmp')

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(tmpFile)) fs.writeFileSync(tmpFile, '')

    await m.reply('✨ sedang membuat backup...')

    const date = new Date().toLocaleDateString('id', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })

    const backupName = `Ryo Yamada - MD - ${date}.zip`
    const output = fs.createWriteStream(backupName)
    const archive = archiver('zip', { zlib: { level: 1 } })

    output.on('close', async () => {
      const ownerChat = global.owner?.[0]?.[0]
        ? global.owner[0][0] + '@s.whatsapp.net'
        : m.sender

      const targetChat = global.backupGroup || ownerChat

      const size = (archive.pointer() / 1024 / 1024).toFixed(2)

      const caption = `✨ Backup Code Bot

📁 File: ${backupName}
📦 Size: ${size} MB
📅 ${date}`

      await conn.sendFile(targetChat, backupName, backupName, caption)

      if (targetChat !== m.chat) {
        await m.reply(global.backupGroup ? '✨ backup berhasil dikirim ke grup' : '✨ backup berhasil dikirim ke PM')
      }

      fs.unlinkSync(backupName)
    })

    archive.on('warning', err => {
      if (err.code !== 'ENOENT') throw err
    })

    archive.on('error', err => {
      throw err
    })

    archive.pipe(output)

    archive.glob('**/*', {
      ignore: [
        'node_modules/**',
        'sessions/**',
        '.npm/**',
        'assets/**',
        'tmp/**/*',
        backupName
      ]
    })
        
    archive.finalize()

  } catch (e) {
    m.reply('❌ backup gagal:\n' + e.message)
  }
}

handler.help = ['backup']
handler.tags = ['owner']
handler.command = /^backup$/i
handler.owner = true

export default handler