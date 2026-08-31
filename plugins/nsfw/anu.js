const SOURCES = {
  panties: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/panties.json',
  masturbation: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/masturbation.json',
  ass: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/ass.json',
  bdsm: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/bdsm.json',
  zettai: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/zettai.json',
  gangbang: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/gangbang.json',
  cuckold: 'https://raw.githubusercontent.com/KazukoGans/database/main/nsfw/cuckold.json'
}

let cache = {}
let lastFetch = {}
const TTL = 5 * 60 * 1000

async function isAlive(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

async function getValidImage(type) {
  const now = Date.now()

  if (!cache[type] || now - lastFetch[type] > TTL) {
    const res = await fetch(SOURCES[type])
    const json = await res.json()
    if (!Array.isArray(json)) return null
    cache[type] = json
    lastFetch[type] = now
  }

  for (let i = 0; i < 5; i++) {
    const img = cache[type][Math.floor(Math.random() * cache[type].length)]
    if (await isAlive(img)) return img
  }

  return null
}

let handler = async (m, { conn, command }) => {
  const img = await getValidImage(command)
  if (!img) return 

  await conn.sendMessage(
    m.chat,
    { image: { url: img } },
    { quoted: m }
  )
}

handler.help = Object.keys(SOURCES)
handler.tags = ['nsfw']
handler.command = new RegExp(`^(${Object.keys(SOURCES).join('|')})$`, 'i')
handler.premium = true

export default handler