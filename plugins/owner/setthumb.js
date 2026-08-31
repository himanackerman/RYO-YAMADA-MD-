import fs from 'fs'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime.startsWith('image/'))
        return m.reply('Reply / kirim gambar untuk dijadikan thumbnail bot')

    let img = await q.download()

    fs.writeFileSync('./thumbnail.jpg', img)

    m.reply('✅ Done wok')
}

handler.help = ['setthumb']
handler.tags = ['owner']
handler.command = /^setthumb$/i
handler.owner = true
handler.limit = false

export default handler