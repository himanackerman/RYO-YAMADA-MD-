const URL_PANTUN = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/gabut/pantun2.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getPantun() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache
  const res = await fetch(URL_PANTUN)
  const json = await res.json()
  if (!Array.isArray(json)) return []
  cache = json
  lastFetch = now
  return cache
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let handler = async (m, { conn }) => {
  const list = await getPantun()
  if (!list.length) return m.reply('Pantun lagi kosong 🥀')

  const item = pick(list)

  let text =
    typeof item === 'string'
      ? item
      : item.pantun || item.text || Object.values(item)[0]

  if (typeof text !== 'string') text = JSON.stringify(text)

  await conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['pantun']
handler.tags = ['quotes']
handler.command = /^pantun$/i
handler.limit = true

export default handler