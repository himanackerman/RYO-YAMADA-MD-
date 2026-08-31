let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let input = clean(text || args?.[0])

  if (!input) {
    throw `Contoh:\n${usedPrefix + command} https://instagram.com/...`
  }

  await m.react('✨')

  try {

    let resApi = await fetch(
      `https://api.nexray.eu.cc/downloader/v2/instagram?url=${encodeURIComponent(input)}`
    )

    if (!resApi.ok) throw 'API error'

    let data = await resApi.json()

    if (!data.status || !data.result?.media?.length) {
      throw 'Media tidak ditemukan'
    }

    let res = data.result

    let caption = `
— instagram downloader —

❀ author : ${cleanText(res.username)}
❀ likes  : ${res.likes?.toLocaleString() || 0}

❀ title :
${cleanText(res.title || '-')}
`.trim()

    let annotations = [
      {
        polygonVertices: [
          { x: 0, y: 0 },
          { x: 1000, y: 0 },
          { x: 1000, y: 1000 },
          { x: 0, y: 1000 }
        ],

        shouldSkipConfirmation: true,

        embeddedContent: {
          embeddedMusic: {
            musicContentMediaId: "1409620227516822",
            songId: "244215252974958",
            author: "Elaina - MD",
            title: "\u200B",
            artistAttribution: "https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K",
            countryBlocklist: "",
            isExplicit: false,
            artworkMediaKey: ""
          }
        },

        embeddedAction: true
      }
    ]

    let images = []
    let videos = []

    for (let item of res.media) {

      if (item.type === 'mp4') {
        videos.push(item.url)
      } else {
        images.push(item.url)
      }
    }

    if (images.length) {

      await conn.sendMessage(m.chat, {
        album: images.map((url, i) => ({
          image: { url },

          caption: i === 0 ? caption : '',

          annotations
        }))
      }, { quoted: m })
    }

    for (let url of videos) {

      await conn.sendMessage(m.chat, {
        video: { url },

        caption,

        annotations
      }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.log(e)

    await m.react('❌')

    m.reply('Error bang')
  }
}

handler.help = ['instagram3']
handler.tags = ['downloader']
handler.command = /^(ig3|igdl3|instagram3)$/i
handler.limit = true

export default handler

function clean(s) {
  return String(s || '').trim()
}

function cleanText(text = '') {
  return text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}