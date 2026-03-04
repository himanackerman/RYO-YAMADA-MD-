/**
 * YTMP3 & YTMP4 Downloader
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 source scrape : https://whatsapp.com/channel/0029Vb7t6q7A89MjyGEBG41y/158
 
 */
 
import axios from 'axios'

const qualityvideo = ['144','240','360','720','1080']
const qualityaudio = ['128','320']

const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': '*/*',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Origin': 'https://iframe.y2meta-uk.com',
  'Referer': 'https://iframe.y2meta-uk.com/'
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function ekstrakid(url) {
  const p = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /watch\?v=([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /live\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/
  ]
  for (const r of p) {
    const m = url.match(r)
    if (m) return m[1]
  }
  throw 'URL YouTube tidak valid'
}

async function search(query) {
  const r = await axios.get(`https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`, { headers })
  if (!r.data?.items?.length) throw 'Lagu tidak ditemukan'
  return r.data.items[0].id
}

async function metadata(videoId) {
  const r = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
  return {
    title: r.data.title,
    author: r.data.author_name,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/0.jpg`
  }
}

async function getkey() {
  const r = await axios.get('https://cnv.cx/v2/sanity/key', { headers })
  return r.data.key
}

async function createjob(id, format, quality) {
  const key = await getkey()
  const isVideo = format === 'mp4'
  const q = String(quality || (isVideo ? '720' : '320'))

  const audio = isVideo ? 128 : (qualityaudio.includes(q) ? q : '320')
  const video = isVideo ? (qualityvideo.includes(q) ? q : '720') : 720

  const r = await axios.post('https://cnv.cx/v2/converter',
    new URLSearchParams({
      link: `https://youtu.be/${id}`,
      format,
      audioBitrate: String(audio),
      videoQuality: String(video),
      filenameStyle: 'pretty',
      vCodec: 'h264'
    }),
    { headers: { ...headers, key } }
  )

  return r.data
}

async function getJob(jobId) {
  const r = await axios.get(`https://cnv.cx/v2/status/${jobId}`, { headers })
  return r.data
}

async function poll(jobId, id, format, quality, meta) {
  for (let i = 0; i < 30; i++) {
    await sleep(2000)
    const s = await getJob(jobId)

    if (s.status === 'completed' && s.url) {
      return {
        ...meta,
        format,
        quality,
        download: s.url,
        filename: s.filename
      }
    }

    if (s.status === 'error') throw s.message
  }
}

async function y2mate(input, format='mp3', quality=null) {
  const isUrl = /youtu\.be|youtube\.com/.test(input)
  const id = isUrl ? ekstrakid(input) : await search(input)

  const meta = await metadata(id)
  const job = await createjob(id, format, quality)

  if (job.status === 'tunnel') {
    return { ...meta, format, quality, download: job.url, filename: job.filename }
  }

  if (job.status === 'processing') {
    return poll(job.jobId, id, format, quality, meta)
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('Masukkan judul atau URL YouTube')

  await m.reply('_✨ otw..._')

  try {
    const isVideo = /ytv|mp4/i.test(command)
    const format = isVideo ? 'mp4' : 'mp3'

    let args = text.split(' ')
    let last = args[args.length - 1]
    let quality = /^\d+$/.test(last) ? last : null
    if (quality) args.pop()

    const query = args.join(' ')

    const res = await y2mate(query, format, quality)

    if (format === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: { url: res.download },
        mimetype: 'audio/mpeg',
        fileName: res.filename,
        contextInfo: {
          externalAdReply: {
            title: res.title,
            body: res.author,
            thumbnailUrl: res.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: res.download },
        caption: `🎬 ${res.title}`
      }, { quoted: m })
    }

  } catch (e) {
    m.reply('❌ Gagal: ' + e)
  }
}

handler.help = ['yta','ytmp3','ytv','ytmp4']
handler.tags = ['downloader']
handler.command = /^(yta|ytmp3|ytv|ytmp4)$/i
handler.limit = true

export default handler
