import { tiktokScrape } from '../../lib/scrape/tikwm.js'
import axios from 'axios'

async function sendCustomMessage(client, jid, content, options = {}) {
  const isMedia = content.video || content.image

  const customContent = {
    ...content,
    mentions: content.mentions || client.parseMention?.(content?.text || content?.caption || '') || []
  }

  if (isMedia) {
    customContent.streamingSidecar = Buffer.from('Omw4hLediba3yg==', 'base64')
    customContent.annotations = [
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
            author: global.author || "ᴇʟᴀɪɴᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ",
            title: global.namebot || "ᴇʟᴀɪɴᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ",
            artistAttribution: "https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K",
            countryBlocklist: "",
            isExplicit: false
          }
        },
        embeddedAction: true
      }
    ]
  }

  return await client.sendMessage(jid, customContent, options)
}

async function searchTikTokNexray(query) {
  const { data } = await axios.get('https://api.nexray.eu.cc/search/tiktok', {
    params: { q: query },
    headers: { 'user-agent': 'Mozilla/5.0' }
  })

  if (!data?.status || !Array.isArray(data.result) || data.result.length === 0) {
    return null
  }

  const item = data.result.find(v => v?.id || v?.data)
  if (!item) return null

  return {
    url: `https://www.tiktok.com/@${item.author?.nickname || 'user'}/video/${item.id}`,
    directData: item.data ? {
      type: 'video',
      title: item.title || '-',
      author: item.author?.nickname || item.author?.fullname || '-',
      video: item.data,
      images: [],
      audio: item.music_info?.url || null
    } : null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const client = typeof conn !== 'undefined' ? conn : sock
  await m.react('✨')

  const input = m.quoted ? m.quoted.text : text
  if (!input) {
    return m.reply(
      `Contoh:\n` +
      `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
      `${usedPrefix + command} ryo yamada edit`
    )
  }

  try {
    let res = null
    const isUrl = /^https?:\/\//i.test(input.trim())

    if (!isUrl) {
      const searchRes = await searchTikTokNexray(input.trim())
      if (!searchRes) throw 'Hasil pencarian tidak ditemukan'

      if (searchRes.directData) {
        res = searchRes.directData
      } else {
        res = await tiktokScrape(searchRes.url)
      }
    } else {
      res = await tiktokScrape(input.trim())
    }

    if (!res) throw 'Gagal mengambil data TikTok'

    const title = (res.title || '-').replace(/\s+/g, ' ').trim()
    const uploader = res.author || '-'

    const caption = `*\`TikTok Downloader\`*

✿ *\`Judul\`* : ${title.length > 80 ? title.slice(0, 80) + '...' : title}
✿ *\`Uploader\`* : ${uploader}`

    if (res.type === 'image' && res.images.length > 0) {
      if (res.images.length === 1) {
        await sendCustomMessage(
          client,
          m.chat,
          {
            image: { url: res.images[0] },
            caption
          },
          { quoted: m }
        )
      } else if (client.sendAlbumMessage) {
        const albumMedias = res.images.slice(0, 10).map(imgUrl => ({
          image: { url: imgUrl },
          caption
        }))
        await client.sendAlbumMessage(m.chat, albumMedias, { delay: 300, quoted: m })
      } else {
        await client.sendMessage(
          m.chat,
          {
            album: res.images.map((img, i) => ({
              image: { url: img },
              caption: i === 0 ? caption : ''
            }))
          },
          { quoted: m }
        )
      }

      if (res.audio) {
        await client.sendMessage(
          m.chat,
          {
            audio: { url: res.audio },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      }

      await m.react('✅')
      return
    }

    if (res.video) {
      await sendCustomMessage(
        client,
        m.chat,
        {
          video: { url: res.video },
          caption
        },
        { quoted: m }
      )
    }

    if (res.audio) {
      await client.sendMessage(
        m.chat,
        {
          audio: { url: res.audio },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw String(e)
  }
}

handler.help = ['tt', 'tiktok']
handler.tags = ['downloader']
handler.command = /^(tt|tiktok)$/i
handler.limit = true
handler.register = false

export default handler