const URL = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/gabut/memerandomv1.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getMemes() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache

  const res = await fetch(URL)
  const json = await res.json()
  if (!Array.isArray(json)) return []

  cache = json
  lastFetch = now
  return cache
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

let handler = async (m, { conn }) => {
  const data = await getMemes()
  if (!data.length) return

  const item = pickRandom(data)
  const url = typeof item === 'string' ? item : item.url
  if (!url) return

  const isVideo = url.endsWith('.mp4')

  await conn.sendMessage(
    m.chat,
    isVideo
      ? { video: { url }, caption: '✨ nih kak' }
      : { image: { url }, caption: '✨ nih kak' },
    { quoted: m }
  )
}

handler.help = ['meme']
handler.tags = ['random']
handler.command = /^meme$/i

export default handler