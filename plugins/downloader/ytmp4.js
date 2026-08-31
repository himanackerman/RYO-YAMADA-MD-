import yts from 'yt-search'
import fs from 'fs'
import {
downloadYoutubeVideo,
cleanupDownload
} from '../../lib/scrape/youtube.js'

let handler = async (m, {
conn,
text,
usedPrefix,
command
}) => {
if (!text) {
throw (
'Contoh:\n' +
usedPrefix + command + ' https://youtu.be/dQw4w9WgXcQ\n' +
usedPrefix + command + ' dj remix\n' +
usedPrefix + command + ' dj remix|720'
)
}

await m.react('🕒')

let result

try {
let [query, resolusi = '360'] = text.split('|')

query = query.trim()
resolusi = resolusi.trim()

let url = query

if (!/^https?:\/\//i.test(query)) {
  const search = await yts(query)
  const video = search.videos[0]

  if (!video) {
    throw 'Video tidak ditemukan.'
  }

  url = video.url
}

try {
  const apiUrl =
    global.APIs.nexray +
    '/downloader/ytmp4?url=' +
    encodeURIComponent(url) +
    '&resolusi=' +
    encodeURIComponent(resolusi)

  const res = await fetch(apiUrl)
  const json = await res.json()

  if (!json.status) {
    throw new Error(
      json.message || 'Gagal mengambil video'
    )
  }

  const data = json.result

  const caption =
    'Author: ' + (data.author || '-') + '\n' +
    'Duration: ' + (data.duration || '-') + ' Detik\n' +
    'Title: ' + (data.title || '-')

  const rich = new AIRich(conn)
    .setTitle('YouTube Video')
    .addText(caption)
    .addVideo({
      url: data.url
    })

  await rich.send(m.chat, {
    quoted: m
  })

  await m.react('✅')
  return

} catch (e) {
  console.log(
    '[YTMP4] Nexray gagal:',
    e.message
  )
}

result = await downloadYoutubeVideo(
  url,
  Number(resolusi) || 360
)

const buffer = fs.readFileSync(result.path)

const caption =
  (result.title || 'YouTube Video') +
  '\nKualitas: ' +
  (result.quality || resolusi) +
  'p'

const rich = new AIRich(conn)
  .setTitle('YouTube Video')
  .addText(caption)
  .addVideo(buffer)

await rich.send(m.chat, {
  quoted: m
})

await m.react('✅')

} catch (e) {
console.error(e)

await m.react('❌')

throw e.message || 'Terjadi kesalahan.'

} finally {
if (result?.outputDir) {
await cleanupDownload(
result.outputDir
).catch(() => {})
}
}
}

handler.help = ['playvid', 'ytmp4']
handler.tags = ['downloader']
handler.command = /^(playvid|ytmp4)$/i
handler.limit = true

export default handler