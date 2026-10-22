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
        results.push(relativePath)
      }
    })
    
    return results
  }

  const files = getFilesRecursively(pluginsDir)

  if (files.length === 0) {
    return m.reply('📦 Tidak ada plugin yang ditemukan.')
  }

  const grouped = {}
  files.forEach(file => {
    const parts = file.split('/')
    if (parts.length > 1) {
      const folder = parts[0]
      const fileName = parts.slice(1).join('/')
      if (!grouped[folder]) grouped[folder] = []
      grouped[folder].push(fileName)
    } else {
      if (!grouped['root']) grouped['root'] = []
      grouped['root'].push(file)
    }
  })

  let caption = `📦 *DAFTAR PLUGIN BOT*\nTotal: *${files.length}* plugin\n\n`

  for (const [folder, pluginList] of Object.entries(grouped)) {
    caption += `📁 *Folder:* ${folder.toUpperCase()}\n`
    pluginList.forEach(p => {
      const fullPath = folder === 'root' ? p.replace(/\.js$/, '') : `${folder}/${p.replace(/\.js$/, '')}`
      caption += `  • ${fullPath}\n`
    })
    caption += `\n`
  }

  caption += `💡 *Penggunaan:* Ketik *${usedPrefix}gp <nama_folder/nama_plugin>* untuk mengambil source code.`

  await m.reply(caption.trim())
}

handler.help = ['listplugin']
handler.tags = ['owner']
handler.command = /^(listplugin|lp|plugins)$/i
handler.rowner = true

export default handler