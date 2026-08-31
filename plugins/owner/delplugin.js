import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
  if (!isOwner) return m.reply('❌ Khusus owner.')

  if (!text) return m.reply(`📦 Contoh:\n${usedPrefix + command} namaplugin\n${usedPrefix + command} owner/namaplugin`)

  // Pastikan nama file diakhiri .js
  if (!text.endsWith('.js')) text += '.js'

  // cari di global.plugins berdasarkan nama file aja (tanpa perlu tau foldernya),
  // ATAU path lengkap kalau user udah nulis folder-nya (mis. "owner/namaplugin.js")
  const keys = Object.keys(global.plugins || {})
  const match = keys.find(v => path.basename(v) === text || v === text)

  if (!match) return m.reply('❌ Plugin tidak ditemukan.')

  const pluginsRoot = path.join(process.cwd(), 'plugins')
  const filePath = path.join(pluginsRoot, match)

  // jaga-jaga: pastikan hasil resolve tetap di dalam folder plugins/ (anti path traversal)
  if (!path.resolve(filePath).startsWith(path.resolve(pluginsRoot))) {
    return m.reply('❌ Path tidak valid.')
  }

  if (!fs.existsSync(filePath)) return m.reply('❌ Plugin tidak ditemukan.')

  try {
    fs.unlinkSync(filePath)
    delete global.plugins[match]
    await m.reply(`✅ Plugin *${match}* berhasil dihapus.`)
  } catch (e) {
    console.error(e)
    await m.reply('❌ Gagal menghapus plugin.')
  }
}

handler.help = ['deleteplugin <namafile>']
handler.tags = ['owner']
handler.command = /^(deleteplugin|delplugin|df)$/i
handler.owner = true

export default handler