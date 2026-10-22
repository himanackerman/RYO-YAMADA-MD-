const anu = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/gabut/memespongbob.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getMemes() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache

  const res = await fetch(anu)
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

  await conn.sendMessage(
    m.chat,
    { image: { url }, caption: '✨ nih kak' },
    { quoted: m }
  )
}

handler.help = ['memespongbob', 'spongebob']
handler.tags = ['random']
handler.command = /^(memespongbob|spongebob)$/i

export default handler