const URL_SADBOY = 'https://raw.githubusercontent.com/zxrow/Asupan/refs/heads/main/gabut/sadboy1.json'

let cache = []
let lastFetch = 0
const TTL = 5 * 60 * 1000

async function getSadboy() {
  const now = Date.now()
  if (cache.length && now - lastFetch < TTL) return cache
  const res = await fetch(URL_SADBOY)
  const json = await res.json()
  if (!Array.isArray(json)) return []
  cache = json
  lastFetch = now
  return cache
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let handler = async (m, { conn }) => {
  const list = await getSadboy()
  if (!list.length) return m.reply('Quote sadboy lagi kosong 😔')
  const quote = pickRandom(list)
  await conn.sendMessage(m.chat, { text: quote }, { quoted: m })
}

handler.help = ['sadboy']
handler.tags = ['quotes']
handler.command = /^sadboy$/i
handler.limit = false

export default handler