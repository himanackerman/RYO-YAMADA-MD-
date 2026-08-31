import { tiktokScrape } from '../../lib/scrape/tikwm.js'

let handler = async (m, { text, conn }) => {
if (!text) {
return m.reply(
'Contoh:\n.ttimg https://vt.tiktok.com/xxxx'
)
}

await m.react('🕒')

try {
const result = await tiktokScrape(text.trim())

if (!result) {
  return m.reply('Gagal mengambil data TikTok.')
}

const images = Array.isArray(result.images)
  ? result.images
  : []

if (!images.length) {
  return m.reply('Post ini bukan slideshow foto.')
}

const title = (result.title || 'TikTok Slide')
  .replace(/\s+/g, ' ')
  .trim()

const uploader = result.author || '-'

const rich = new AIRich(conn)
  .setTitle('TikTok Photo Slide')
  .addText(
    'Judul: ' + title + '\n' +
    'Uploader: ' + uploader + '\n' +
    'Total Foto: ' + images.length
  )

for (const [i, imageUrl] of images.entries()) {
  if (!imageUrl) continue

  rich.addImage(imageUrl, {
    id: 'image_' + i
  })
}

await rich.send(m.chat, {
  quoted: m
})

} catch (e) {
console.error(e)

return m.reply(
  'Gagal mengambil slide: ' +
  (e.message || e)
)

}
}

handler.help = ['ttimg <url>', 'tiktokimg <url>']
handler.tags = ['downloader']
handler.command = /^(ttimg|tiktokimg)$/i
handler.limit = true
handler.register = true

export default handler