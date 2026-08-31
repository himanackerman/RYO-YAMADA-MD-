import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
  const pluginsDir = path.join(process.cwd(), 'plugins')
  
  if (!fs.existsSync(pluginsDir)) {
    return m.reply('❌ Folder plugins tidak ditemukan.')
  }

  const getFilesRecursively = (dir) => {
    let results = []
    const list = fs.readdirSync(dir)
    
    list.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath))
      } else if (file.endsWith('.js')) {
        const relativePath = path.relative(pluginsDir, filePath).replace(/\\/g, '/')
        results.push({
          path: relativePath,
          mtime: stat.mtimeMs
        })
      }
    })
    
    return results
  }

  const files = getFilesRecursively(pluginsDir)

  if (files.length === 0) {
    return m.reply('📦 Tidak ada plugin yang ditemukan.')
  }

  files.sort((a, b) => b.mtime - a.mtime)

  const latest = files.slice(0, 10)

  let caption = `✨ *DAFTAR PLUGIN TERBARU*\n\n`

  latest.forEach((file, index) => {
    const date = new Date(file.mtime).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short'
    })
    caption += `${index + 1}. *${file.path}*\n   🕒 ${date}\n\n`
  })

  caption += `💡 Gunakan *${usedPrefix}gp <path>* untuk mengambil source code.`

  await m.reply(caption.trim())
}

handler.help = ['newplugin', 'pluginbaru']
handler.tags = ['owner']
handler.command = /^(newplugin|pluginbaru|np)$/i
handler.rowner = true

export default handler