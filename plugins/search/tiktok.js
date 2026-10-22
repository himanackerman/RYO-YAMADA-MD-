import axios from 'axios'

const headers = {
  'user-agent': 'Mozilla/5.0'
}

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

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const client = typeof conn !== 'undefined' ? conn : sock

  if (!text) {
    return m.reply(
      `Masukkan kata kunci TikTok.\n\nContoh:\n${usedPrefix + command} Makima edit`
    )
  }

  await m.react('🕐')

  try {
    const { data } = await axios.get('https://api.nexray.eu.cc/search/tiktok', {
      params: {
        q: text
      },
      headers
    })

    if (!data?.status || !Array.isArray(data.result) || data.result.length === 0) {
      await m.react('❌')
      return m.reply('Video TikTok tidak ditemukan.')
    }

    const result = data.result.find(v => v?.data)

    if (!result) {
      await m.react('❌')
      return m.reply('Media video tidak ditemukan pada hasil pencarian.')
    }

    const caption = `— tiktok search —\n\n` +
      `❀ Judul : ${result.title || 'TikTok Video'}\n` +
      `❀ Uploader : ${result.author?.nickname || 'Unknown'}`

    await sendCustomMessage(
      client,
      m.chat,
      {
        video: {
          url: result.data
        },
        mimetype: 'video/mp4',
        caption: caption
      },
      {
        quoted: m
      }
    )

    await m.react('✅')

  } catch (e) {
    console.log('TikTok Search Error:', e)

    await m.react('❌')

    return m.reply(
      `Error: ${e.response?.data?.msg || e.message || e}`
    )
  }
}

handler.help = ['ttsearch']
handler.tags = ['search']
handler.command = ['ttsearch', 'tiktoksearch']
handler.limit = true

export default handler