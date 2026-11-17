/**
 * Scraper : SoundCloud Direct Stream Downloader & Search
 * base : https://m.soundcloud.com/
 * creator : hilman 
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'

let cachedClientId = null

async function getClientId() {
  if (cachedClientId) return cachedClientId

  const res = await fetch('https://soundcloud.com', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  })
  const html = await res.text()

  const scriptUrls = [...html.matchAll(/<script[^>]+src="([^">]+\.js)"/g)].map(
    (m) => m[1]
  )

  for (const scriptUrl of scriptUrls.reverse()) {
    try {
      const sRes = await fetch(scriptUrl)
      const sText = await sRes.text()
      const match =
        sText.match(/client_id\s*:\s*["']([a-zA-Z0-9]{32})["']/) ||
        sText.match(/client_id=([a-zA-Z0-9]{32})/)
      if (match) {
        cachedClientId = match[1]
        return cachedClientId
      }
    } catch (_) {}
  }

  throw new Error('Gagal mengekstrak client_id SoundCloud')
}

/**
 * Fitur Search SoundCloud
 */
export async function searchSoundCloud(query, limit = 10) {
  const clientId = await getClientId()

  const searchUrl = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(
    query.trim()
  )}&client_id=${clientId}&limit=${limit}&offset=0`

  const res = await fetch(searchUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  })

  if (!res.ok) {
    cachedClientId = null
    throw new Error(`Gagal mencari lagu di SoundCloud (${res.status})`)
  }

  const json = await res.json()
  const collection = json.collection || []

  return collection
    .filter((item) => item.permalink_url)
    .map((track) => {
      const totalSeconds = Math.floor((track.duration || 0) / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = (totalSeconds % 60).toString().padStart(2, '0')

      return {
        id: track.id,
        title: track.title,
        artist: track.user?.username || '-',
        duration: `${minutes}:${seconds}`,
        url: track.permalink_url,
        thumbnail:
          track.artwork_url?.replace('-large', '-t500x500') ||
          track.user?.avatar_url ||
          null,
        playCount: track.playback_count || 0,
        likeCount: track.likes_count || 0
      }
    })
}

export async function scrapeSoundCloud(trackUrl) {
  const clientId = await getClientId()

  const resolveRes = await fetch(
    `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(
      trackUrl
    )}&client_id=${clientId}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    }
  )

  if (!resolveRes.ok) {
    cachedClientId = null
    throw new Error(`Track tidak ditemukan atau tidak valid (${resolveRes.status})`)
  }

  const track = await resolveRes.json()

  const transcodings = track.media?.transcodings || []
  if (!transcodings.length) {
    throw new Error('Format media tidak ditemukan pada lagu ini.')
  }

  const progressive = transcodings.find(
    (t) => t.format.protocol === 'progressive'
  )
  const hls =
    transcodings.find((t) => t.format.protocol === 'hls') || transcodings[0]

  const selected = progressive || hls

  const streamRes = await fetch(`${selected.url}?client_id=${clientId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  const streamData = await streamRes.json()
  const finalStreamUrl = streamData.url

  const totalSeconds = Math.floor((track.duration || 0) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = (totalSeconds % 60).toString().padStart(2, '0')

  return {
    title: track.title || 'SoundCloud Track',
    artist: track.user?.username || '-',
    duration: `${minutes}:${seconds}`,
    thumbnail:
      track.artwork_url?.replace('-large', '-t500x500') ||
      track.user?.avatar_url ||
      null,
    genre: track.genre || '-',
    protocol: selected.format.protocol,
    streamUrl: finalStreamUrl
  }
}

export async function downloadSoundCloudBuffer(streamUrl, protocol) {
  if (protocol === 'progressive') {
    const res = await fetch(streamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      mimetype: 'audio/mpeg',
      ext: 'mp3'
    }
  }

  return new Promise((resolve, reject) => {
    const buffers = []
    const passThrough = new PassThrough()

    passThrough.on('data', (chunk) => buffers.push(chunk))
    passThrough.on('end', () => {
      resolve({
        buffer: Buffer.concat(buffers),
        mimetype: 'audio/mpeg',
        ext: 'mp3'
      })
    })
    passThrough.on('error', reject)

    ffmpeg(streamUrl)
      .inputOptions([
        '-user_agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      ])
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .format('mp3')
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`))
      })
      .pipe(passThrough)
  })
}