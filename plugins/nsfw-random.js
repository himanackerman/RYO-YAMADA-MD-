import fetch from 'node-fetch'

const APIS = [
  { url: 'https://api.waifu.pics/nsfw/waifu', pick: j => j.url },
  { url: 'https://nekos.life/api/v2/img/lewd', pick: j => j.url },
  { url: 'https://nekobot.xyz/api/image?type=lewd', pick: j => j.message },
  { url: 'https://neko-love.xyz/api/v1/lewd', pick: j => j.url },
  { url: 'https://api.waifu.im/search?included_tags=ero', pick: j => j.images?.[0]?.url },
  { url: 'https://nekos.best/api/v2/lewd', pick: j => j.results?.[0]?.url },
  { url: 'https://hmtai.hatsunia.cfd/v2/random', pick: j => j.url }
]

async function tryFetch(api) {
  const res = await fetch(api.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  })

  if (!res.ok) throw new Error()

  const json = await res.json()
  const img = api.pick(json)

  if (!img) throw new Error()

  return img
}

let handler = async (m, { conn }) => {
  try {

    await m.react('✨')

    let imageUrl = null

    for (const api of APIS) {
      try {
        imageUrl = await tryFetch(api)
        if (imageUrl) break
      } catch {}
    }

    if (!imageUrl) {
      await m.react('❌')
      return m.reply('Semua API sedang bermasalah, coba lagi.')
    }

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: '_Nih hehe_',
      footer: 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ',
      buttons: [
        {
          buttonId: '.nsfw3',
          buttonText: { displayText: '✨ Next' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Terjadi kesalahan.')
  }
}

handler.help = ['nsfw3']
handler.tags = ['nsfw']
handler.command = /^nsfw3$/i
handler.premium = true
handler.group = false
handler.limit = false

export default handler
