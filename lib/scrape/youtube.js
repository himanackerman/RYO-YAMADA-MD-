const SAVE_TUBE = 'https://media.savetube.vip/api/random-cdn'
const AES_KEY = 'C5D58EF67A7584E4A29F6C35BBC4EB12'

const hexToBytes = hex =>
  new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16))
  )

const getCdn = async () => {
  const res = await fetch(SAVE_TUBE)
  if (!res.ok) throw new Error(`Random CDN Error: ${res.status}`)

  const data = await res.json()

  if (!data?.cdn) {
    throw new Error('CDN SaveTube tidak ditemukan')
  }

  return data.cdn.startsWith('http')
    ? data.cdn
    : `https://${data.cdn}`
}

const getInfo = async (cdn, url) => {
  const res = await fetch(`${cdn}/v2/info`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36'
    },
    body: JSON.stringify({ url })
  })

  const data = await res.json()

  if (!data?.status || !data?.data) {
    throw new Error(
      data?.message || `SaveTube Info Error: ${res.status}`
    )
  }

  return data
}

const decryptInfo = async encrypted => {
  const raw = Buffer.from(encrypted, 'base64')

  const iv = raw.subarray(0, 16)
  const ciphertext = raw.subarray(16)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(AES_KEY),
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv
    },
    cryptoKey,
    ciphertext
  )

  return JSON.parse(
    new TextDecoder().decode(decrypted)
  )
}

const getDownload = async (cdn, key, type, quality) => {
  const res = await fetch(`${cdn}/download`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36'
    },
    body: JSON.stringify({
      downloadType: type,
      quality,
      key
    })
  })

  const data = await res.json()

  if (!data?.status || !data?.data?.downloadUrl) {
    throw new Error(
      data?.message || 'Download URL tidak ditemukan'
    )
  }

  return data.data.downloadUrl
}

const extractVideoId = url => {
  const match = String(url || '').match(
    /(?:youtu\.be\/|(?:www\.|m\.|music\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([a-zA-Z0-9_-]{11})/i
  )
  return match ? match[1] : null
}

const saveTube = async (
  url,
  type = 'audio',
  quality = '128'
) => {
  const cleanUrl = String(url || '').trim()

  if (!cleanUrl || !/^https?:\/\/((www|m|music)\.)?(youtube\.com|youtu\.be)\//i.test(cleanUrl)) {
    throw new Error('URL YouTube tidak valid')
  }

  if (!['audio', 'video'].includes(type)) {
    throw new Error('Type harus audio atau video')
  }

  const videoId = extractVideoId(cleanUrl)
  const targetUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : cleanUrl

  let cdn
  let info
  let lastError

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      cdn = await getCdn()
      info = await getInfo(cdn, targetUrl)
      lastError = null
      break
    } catch (err) {
      lastError = err
    }
  }

  if (lastError) {
    throw lastError
  }

  const data = await decryptInfo(info.data)

  let selectedQuality = String(quality)

  if (type === 'audio') {
    const formats = data.audio_formats || []

    const selected =
      formats.find(x => String(x.quality) === selectedQuality) ||
      formats[0]

    if (!selected) {
      throw new Error('Format audio tidak tersedia')
    }

    selectedQuality = String(selected.quality)
  }

  if (type === 'video') {
    const formats = data.video_formats || []

    const selected =
      formats.find(x => String(x.quality) === selectedQuality) ||
      formats.find(x => x.default_selected) ||
      formats[0]

    if (!selected) {
      throw new Error('Format video tidak tersedia')
    }

    selectedQuality = String(
      selected.quality || selected.height
    )
  }

  const downloadUrl = await getDownload(
    cdn,
    data.key,
    type,
    selectedQuality
  )

  return {
    status: true,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.durationLabel,
    type,
    quality: selectedQuality,
    key: data.key,
    downloadUrl
  }
}

export {
  saveTube,
  getCdn,
  getInfo,
  decryptInfo,
  getDownload
}

export default saveTube
      
