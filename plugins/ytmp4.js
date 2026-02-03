/**
  *» Nama :* — [ YTMP3 & YTMP4 - DL ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://v2.ytmp3.wtf
  *» Saluran :* https://whatsapp.com/channel/0029Vb7XfVV2v1IzPVqjgq37
  *» Creator :* -Ɗαnčoᴡ々
**/

import fetch from 'node-fetch'

// audio support:
// - mp3 (default)

// video support:
// - 256p SD
// - 426p SD
// - 640p SD
// - 854p HD
// - 1080p HD
// - 1280p UHD
// - 1920p UHD
// - best (best available)

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/

async function getMetadata(url) {
  try {
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
      headers: {
        'user-agent': UA,
        'accept': 'application/json'
      }
    })
    const t = await r.text()
    if (t.trim().startsWith('{')) return JSON.parse(t)
  } catch {}
  return null
}

async function getToken(url, type) {
  const page = type === 'mp3' ? 'button' : 'vidbutton'
  const r = await fetch(`https://v2.ytmp3.wtf/${page}/?url=${encodeURIComponent(url)}`, {
    headers: {
      'user-agent': UA,
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'id-ID,id;q=0.6',
      'referer': 'https://v2.ytmp3.wtf/',
      'upgrade-insecure-requests': '1',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document'
    }
  })

  const html = await r.text()
  const cookie = r.headers.get('set-cookie') || ''
  const phpsessid = cookie.match(/PHPSESSID=([^;]+)/)?.[1]
  const tokenId = html.match(/'token_id':\s*'([^']+)'/)?.[1]
  const validTo = html.match(/'token_validto':\s*'([^']+)'/)?.[1]

  if (!phpsessid || !tokenId || !validTo) throw 'Gagal mengambil token'
  return { phpsessid, tokenId, validTo }
}

async function startConvert(url, token, type) {
  const endpoint = type === 'mp3' ? 'convert' : 'vidconvert'
  const body = new URLSearchParams({
    url,
    convert: 'gogogo',
    token_id: token.tokenId,
    token_validto: token.validTo
  })

  const r = await fetch(`https://v2.ytmp3.wtf/${endpoint}/`, {
    method: 'POST',
    headers: {
      'user-agent': UA,
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': 'https://v2.ytmp3.wtf',
      'referer': `https://v2.ytmp3.wtf/${type === 'mp3' ? 'button' : 'vidbutton'}/?url=${encodeURIComponent(url)}`,
      'cookie': `PHPSESSID=${token.phpsessid}`,
      'x-requested-with': 'XMLHttpRequest',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty'
    },
    body
  })

  const t = await r.text()
  if (!t.trim().startsWith('{')) throw 'Response konversi bukan JSON'
  const j = JSON.parse(t)
  if (!j.jobid) throw j.error || 'Job ID tidak ditemukan'
  return j.jobid
}

async function poll(jobid, token, type) {
  const endpoint = type === 'mp3' ? 'convert' : 'vidconvert'
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const r = await fetch(`https://v2.ytmp3.wtf/${endpoint}/?jobid=${jobid}&time=${Date.now()}`, {
      headers: {
        'user-agent': UA,
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'referer': 'https://v2.ytmp3.wtf/',
        'cookie': `PHPSESSID=${token.phpsessid}`,
        'x-requested-with': 'XMLHttpRequest'
      }
    })
    const t = await r.text()
    if (!t.trim().startsWith('{')) continue
    const j = JSON.parse(t)
    if (j.error) throw j.error
    if (j.ready && j.dlurl) return j.dlurl
  }
  throw 'Konversi timeout'
}

const handler = async (m, { conn, text, command }) => {
  if (!text) throw 'Masukkan link YouTube'

  const match = text.match(YT_REGEX)
  if (!match) throw 'URL YouTube tidak valid'

  const videoUrl = `https://youtu.be/${match[1]}`
  const isMp3 = command === 'ytmp3'

  await m.reply(isMp3 ? 'Sedang mendownload audio...' : 'Sedang mendownload video...')

  const meta = await getMetadata(videoUrl)
  const token = await getToken(videoUrl, isMp3 ? 'mp3' : 'mp4')
  const jobid = await startConvert(videoUrl, token, isMp3 ? 'mp3' : 'mp4')
  const dlUrl = await poll(jobid, token, isMp3 ? 'mp3' : 'mp4')

  const res = await fetch(dlUrl, { headers: { 'user-agent': UA } })
  if (!res.ok) throw 'Gagal mengunduh file'
  const buffer = await res.buffer()

  const title = meta?.title?.replace(/[^\w\s]/g, '').substring(0, 50)

  if (isMp3) {
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${title || match[1]}.mp3`
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: `${title || match[1]}.mp4`,
      caption: meta ? `${meta.title}\n${meta.author_name}` : match[1]
    }, { quoted: m })
  }
}

handler.help = ['ytmp3 <url>', 'ytmp4 <url>']
handler.tags = ['downloader']
handler.command = ['ytmp3', 'ytmp4']
handler.limit = true 

export default handler