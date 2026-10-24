import { createDecipheriv } from 'crypto'

const METADATA_DECRYPTION_KEY = Buffer.from(
  'C5D58EF67A7584E4A29F6C35BBC4EB12',
  'hex'
)

const HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'https://yt.savetube.me',
  'Referer': 'https://yt.savetube.me/', 
  'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
}

export async function youtube(url, {
  downloadType = 'audio',
  quality = '128'
} = {}) {
  const idMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
  )

  if (!idMatch) {
    throw new Error('URL YouTube tidak valid')
  }

  const videoId = idMatch[1]
  const formattedQuality = quality.toString().replace(/[^0-9]/g, '')

  const cdnRes = await fetch('https://media.savetube.vip/api/random-cdn', {
    headers: HEADERS
  })

  if (!cdnRes.ok) {
    throw new Error(`Gagal memilih CDN (${cdnRes.status})`)
  }

  const cdn = await cdnRes.json()

  if (!cdn.cdn) {
    throw new Error('CDN SaveTube tidak tersedia')
  }

  const infoRes = await fetch(`https://${cdn.cdn}/v2/info`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${videoId}`
    })
  })

  if (!infoRes.ok) {
    throw new Error(`Gagal mengambil metadata (${infoRes.status})`)
  }

  const info = await infoRes.json()

  if (!info.data) {
    throw new Error(info.message || 'Metadata YouTube tidak ditemukan')
  }

  const encrypted = Buffer.from(info.data, 'base64')

  if (encrypted.length <= 16) {
    throw new Error('Data metadata tidak valid')
  }

  const decipher = createDecipheriv(
    'aes-128-cbc',
    METADATA_DECRYPTION_KEY,
    encrypted.subarray(0, 16)
  )

  const decrypted = Buffer.concat([
    decipher.update(encrypted.subarray(16)),
    decipher.final()
  ])

  const metadata = JSON.parse(decrypted.toString('utf8'))

  const dlRes = await fetch(`https://${cdn.cdn}/download`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      id: videoId,
      downloadType,
      quality: formattedQuality,
      key: metadata.key
    })
  })

  if (!dlRes.ok) {
    throw new Error(`Gagal meminta unduhan (${dlRes.status})`)
  }

  const dl = await dlRes.json()
  const downloadUrl = dl.data?.downloadUrl || dl.data?.url

  if (!downloadUrl) {
    throw new Error(dl.message || 'Gagal mengambil link media')
  }

  const mediaRes = await fetch(downloadUrl, { headers: HEADERS })

  if (!mediaRes.ok) {
    throw new Error(`Gagal mengunduh file media CDN (${mediaRes.status})`)
  }
  const buffer = Buffer.from(await mediaRes.arrayBuffer())

  return {
    title: metadata.title,
    duration: metadata.durationLabel,
    thumbnail: metadata.thumbnail,
    url: downloadUrl,
    buffer,
    size: dl.data?.size || 0
  }
}

export default youtube
