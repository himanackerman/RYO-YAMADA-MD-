import { tiktokScrape } from '../../lib/scrape/tikwm.js'
import axios from 'axios'

async function searchTikTokNexray(query) {
const { data } = await axios.get(
'https://api.nexray.eu.cc/search/tiktok',
{
params: { q: query },
headers: {
'user-agent': 'Mozilla/5.0'
}
}
)

if (
!data?.status ||
!Array.isArray(data.result) ||
data.result.length === 0
) {
return null
}

const item = data.result.find(v => v?.id || v?.data)

if (!item) return null

return {
url:
'https://www.tiktok.com/@' +
(item.author?.nickname || 'user') +
'/video/' +
item.id,

directData: item.data
  ? {
      type: 'video',
      title: item.title || '-',
      author:
        item.author?.nickname ||
        item.author?.fullname ||
        '-',
      video: item.data,
      images: [],
      audio: item.music_info?.url || null
    }
  : null

}
}

let handler = async (m, {
conn,
text,
usedPrefix,
command
}) => {
const input = m.quoted?.text || text

if (!input) {
return m.reply(
'Contoh:\n' +
usedPrefix + command + ' https://vt.tiktok.com/xxxx\n' +
usedPrefix + command + ' ryo yamada edit'
)
}

try {
await m.react('🕒')

let res = null

const isUrl = /^https?:\/\//i.test(input.trim())

if (!isUrl) {
  const searchRes = await searchTikTokNexray(input.trim())

  if (!searchRes) {
    throw 'Hasil pencarian tidak ditemukan'
  }

  if (searchRes.directData) {
    res = searchRes.directData
  } else {
    res = await tiktokScrape(searchRes.url)
  }

} else {
  res = await tiktokScrape(input.trim())
}

if (!res) {
  throw 'Gagal mengambil data TikTok'
}

const title = (res.title || '-')
  .replace(/\s+/g, ' ')
  .trim()

const uploader = res.author || '-'

const finalTitle =
  title.length > 80
    ? title.slice(0, 80) + '...'
    : title

const caption =
  'TikTok Downloader\n\n' +
  'Judul: ' + finalTitle + '\n' +
  'Uploader: ' + uploader

if (
  res.type === 'image' &&
  Array.isArray(res.images) &&
  res.images.length > 0
) {
  const rich = new AIRich(conn)
    .setTitle('TikTok Photo Slide')
    .addText(caption)

  for (const [i, imageUrl] of res.images.entries()) {
    if (!imageUrl) continue

    rich.addImage(imageUrl, {
      id: 'image_' + i
    })
  }

  await rich.send(m.chat, {
    quoted: m
  })

  return
}

if (res.video) {
  const rich = new AIRich(conn)
    .setTitle('TikTok Downloader')
    .addText(caption)
    .addVideo({
      url: res.video
    })

  await rich.send(m.chat, {
    quoted: m
  })

  return
}

throw 'Media TikTok tidak ditemukan'

} catch (e) {
console.error(e)

throw String(e?.message || e)

}
}

handler.help = ['tt2 <url/query>', 'tiktok2 <url/query>']
handler.tags = ['downloader']
handler.command = /^(tt2|tiktok2)$/i
handler.limit = true
handler.register = false

export default handler