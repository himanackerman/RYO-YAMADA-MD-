/*
get code dari https://codeshare.cloudku.click
*/
import fetch from 'node-fetch'

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Contoh penggunaan:\n${usedPrefix + command} https://codeshare.cloudku.click/view?id=J5PNIe84`)
  let url = args[0]

  try {
    if (!url.startsWith('http') || !url.includes('codeshare.cloudku.click')) {
      return m.reply('❌ URL tidak valid atau bukan dari codeshare.cloudku.click')
    }

    let cleanUrl = url.trim().replace(/\&raw\=true$/, '') + '&raw=true'
    let res = await fetch(cleanUrl)

    if (!res.ok) throw 'Gagal fetch data'
    
    let code = await res.text()
    if (code.length > 65535) return m.reply('❌ Kode terlalu panjang untuk dikirim dalam satu pesan.')

    m.reply(code)
  } catch (e) {
    m.reply(`❌ Terjadi kesalahan saat mengambil kode.\n\n${e}`)
  }
}

handler.help = ['getcode <url>']
handler.tags = ['tools']
handler.command = /^getcode$/i

export default handler