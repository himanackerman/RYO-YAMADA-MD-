import { uguu } from '../../lib/scrape/uguu.js'

let handler = async (m) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!mime) return m.reply('Reply media')

  await m.reply('wait')

  try {
    const buffer = await q.download()

    const ext = mime.split('/')[1]?.split(';')[0] || 'bin'
    const filename =
      q.fileName ||
      `file.${ext}`

    const { url } = await uguu(buffer, filename, mime)

    await m.reply(url)
  } catch (e) {
    console.error(e)
    m.reply(`Gagal upload\n\n${e.message}`)
  }
}

handler.help = ['uguu']
handler.tags = ['tools']
handler.command = /^uguu$/i
handler.limit = false

export default handler