import fs from 'fs'

global.listedPlugins = [] // simpan di global

let handler = async (m, { conn }) => {
  try {
    const files = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'))
    if (!files.length) return m.reply('❌ Tidak ada plugin ditemukan.')

    global.listedPlugins = files // simpan ke global

    let list = `📦 *Daftar Plugin:*\n\n`
    files.forEach((file, i) => {
      list += `${i + 1}. ${file}\n`
    })

    m.reply(list)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membaca folder plugins.')
  }
}

handler.help = ['listplugin']
handler.tags = ['owner']
handler.command = /^listplugin$/i
handler.owner = true

export default handler