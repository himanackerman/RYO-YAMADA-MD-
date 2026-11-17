import axios from 'axios'
import { tikdown } from '../../lib/scrape/tikdown.js'

async function sendCustomMessage(client, jid, content, options = {}) {
  const isMedia = content.video || content.image

  const customContent = {
    ...content,
    mentions: content.mentions ||
      client.parseMention?.(content?.text || content?.caption || '') || []
  }

  if (isMedia) {
    customContent.streamingSidecar = Buffer.from(
      'Omw4hLediba3yg==',
      'base64'
    )

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
            musicContentMediaId: '1409620227516822',
            songId: '244215252974958',
            author: global.author || 'ᴇʟᴀɪɴᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ',
            title: global.namebot || 'ᴇʟᴀɪɴᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ',
            artistAttribution: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K',
            countryBlocklist: '',
            isExplicit: false
          }
        },
        embeddedAction: true
      }
    ]
  }

  return client.sendMessage(jid, customContent, options)
}

async function searchTikTokNexray(query) {
  const { data } = await axios.get(
    'https://api.nexray.eu.cc/search/tiktok',
    {
      params: { q: query },
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 30000
    }
  )

  if (!data?.status || !Array.isArray(data.result) || !data.result.length)
    return null

  const item = data.result.find(v => v?.id || v?.data)
  if (!item) return null

  return {
    url: `https://www.tiktok.com/@${item.author?.nickname || 'user'}/video/${item.id}`,
    directData: item.data ? {
      type: 'video',
      title: item.title || '-',
      author: item.author?.nickname || item.author?.fullname || '-',
      videoUrl: item.data,
      images: [],
      audio: item.music_info?.url || null
    } : null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (m.quoted?.text || text || '').trim()

  if (!input) {
    return m.reply(
      `Contoh penggunaan:\n\n` +
      `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
      `${usedPrefix + command} ryo yamada edit`
    )
  }

  try {
    let res = null
    const isUrl = /^https?:\/\//i.test(input)

    if (!isUrl) {
      const searchRes = await searchTikTokNexray(input)

      if (!searchRes)
        throw new Error('Hasil pencarian tidak ditemukan')

      res = searchRes.directData || await tikdown(searchRes.url)
    } else {
      if (!/tiktok\.com\//i.test(input))
        throw new Error('URL TikTok tidak valid')

      res = await tikdown(input)
    }

    if (!res)
      throw new Error('Gagal mengambil data TikTok')

    const title = (res.title || '-').replace(/\s+/g, ' ').trim()
    const uploader = res.author || '-'

    const caption =
      `*\`TikTok Downloader\`*\n\n` +
      `✿ Judul : ${title}\n` +
      `✿ Uploader : ${uploader}`

    const isImage = res.type === 'image' || (Array.isArray(res.images) && res.images.length > 0)

    if (isImage) {
      if (res.images.length === 1) {
        await sendCustomMessage(
          conn,
          m.chat,
          {
            image: { url: res.images[0] },
            caption
          },
          { quoted: m }
        )
      } else {
        const albumMedias = res.images.map((imgUrl, i) => ({
          image: imgUrl,
          ...(i === 0 ? { caption } : {})
        }))

        try {
          await conn.sendAlbum(
            m.chat,
            albumMedias,
            { quoted: m, delay: 500 }
          )
        } catch (e) {
          console.error('[TIKTOK ALBUM ERROR]', e)

          for (let i = 0; i < res.images.length; i++) {
            await sendCustomMessage(
              conn,
              m.chat,
              {
                image: { url: res.images[i] },
                ...(i === 0 ? { caption } : {})
              },
              { quoted: m }
            )
          }
        }
      }

      if (res.audio) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: res.audio },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )
      }

      return
    }

    const videoTarget = res.videoUrl || (typeof res.video === 'string' ? res.video : res.video?.fhd || res.video?.hd || res.video?.sd || res.video?.default)

    if (videoTarget) {
      await sendCustomMessage(
        conn,
        m.chat,
        {
          video: { url: videoTarget },
          caption
        },
        { quoted: m }
      )
    } else {
      throw new Error('Video tidak ditemukan')
    }

    if (res.audio) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: res.audio },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error('[TIKTOK DOWNLOADER ERROR]', e)
    return m.reply(`Gagal memproses TikTok:\n${e.message || e}`)
  }
}

handler.help = ['tt', 'tiktok']
handler.tags = ['downloader']
handler.command = /^(tt|tiktok)$/i
handler.limit = true
handler.register = false

export default handler
