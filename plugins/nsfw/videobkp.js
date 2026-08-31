const URL = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/video/videobkb.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getList() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache

  const res = await fetch(URL)
  let text = await res.text()
  text = text.replace(/,\s*]/g, ']')

  let json
  try {
    json = JSON.parse(text)
  } catch {
    return []
  }

  cache = json
    .map(v => v.url || Object.values(v)[0])
    .filter(v => typeof v === 'string')

  lastFetch = now
  return cache
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

let handler = async (m, { conn }) => {
  const list = await getList()
  if (!list.length) return m.reply('Video tidak tersedia')

  const url = pickRandom(list)

  await conn.sendMessage(
    m.chat,
    { text: `🎬 Video BKB\n\n${url}` },
    { quoted: m }
  )
}

handler.help = ['videobkp']
handler.tags = ['nsfw']
handler.command = /^videobkp$/i
handler.premium = true

export default handler