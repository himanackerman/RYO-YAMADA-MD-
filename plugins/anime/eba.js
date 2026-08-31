const URL = 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/eba.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getEba() {
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
  const data = await getEba()
  if (!data.length) return

  const img = pickRandom(data)

  await conn.sendMessage(
    m.chat,
    { image: { url: img } },
    { quoted: m }
  )
}

handler.help = ['eba']
handler.tags = ['anime']
handler.command = /^eba$/i

export default handler