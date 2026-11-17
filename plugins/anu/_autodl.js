import { download } from '../../lib/scrape/savefrom.js'
import { tiktokScrape } from '../../lib/scrape/tikwm.js'

const SUPPORTED = /tiktok\.com|instagram\.com|facebook\.com|fb\.watch|twitter\.com|x\.com|threads\.net|youtube\.com|youtu\.be|dailymotion\.com|dai\.ly|vimeo\.com|reddit\.com|pin\.it|pinterest\.com/i

let handler = {}

function makeCaption({ title, hosting, duration }) {
  return `*\`Auto Download\`*\n\n` +
    `✿ Title : ${title || '-'}\n` +
    `✿ Hosting : ${hosting || '-'}\n` +
    `✿ Duration : ${duration || '-'}`
}

handler.before = async (m, { conn }) => {
  const text =
    m.text ||
    m.caption ||
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ""

  if (!text) return
  if (m.fromMe) return
  if (/^[.#!\/]/.test(text)) return

  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat.autodl) return

  const url = text.match(/https?:\/\/[^\s]+/)?.[0]
  if (!url) return

  if (!SUPPORTED.test(url)) return

  try {
    await m.react('🕒')

    if (/tiktok\.com/i.test(url)) {
      const tt = await tiktokScrape(url)

      const caption = `*\`TikTok Auto Download\`*\n\n` +
        `✿ Judul : ${tt.title || '-'}\n` +
        `✿ Uploader : ${tt.author || '-'}`

      if (tt.type === 'video') {
        await conn.sendMessage(m.chat, {
          video: { url: tt.video },
          caption
        }, { quoted: m })
      } else if (tt.images && tt.images.length > 0) {
        if (tt.images.length === 1) {
          await conn.sendMessage(m.chat, {
            image: { url: tt.images[0] },
            caption
          }, { quoted: m })
        } else {
          const albumMedias = tt.images.map((imgUrl, i) => ({
            image: imgUrl,
            ...(i === 0 ? { caption } : {})
          }))

          try {
            await conn.sendAlbum(m.chat, albumMedias, { quoted: m, delay: 500 })
          } catch (e) {
            console.error('sendAlbum gagal, kirim foto pertama:', e)
            await conn.sendMessage(m.chat, {
              image: { url: tt.images[0] },
              caption
            }, { quoted: m })
          }
        }
      }

      return await m.react('✅')
    }

    const data = await download(url)

    if (!data.url || !data.url.length) {
      throw new Error('Media tidak ditemukan.')
    }

    const title = data.meta?.title || data.id || 'Media'
    const duration = data.meta?.duration ? `${data.meta.duration} Detik` : '-'
    const hosting = data.hosting || '-'

    const caption = makeCaption({
      title,
      hosting,
      duration
    })

    const chosenMedia = data.url.find(v => v.type === 'mp4' || v.ext === 'mp4' || v.url?.includes('.mp4')) ||
      data.url.find(v => v.url) ||
      data.url[0]

    const mediaUrl = chosenMedia.url
    if (!mediaUrl) throw new Error('URL media tidak ditemukan.')

    const isAudio = chosenMedia.type === 'audio' || chosenMedia.ext === 'mp3' || chosenMedia.audio

    if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: { url: mediaUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })
    } else {
      const isFileDoc = (chosenMedia.filesize && chosenMedia.filesize > 50 * 1024 * 1024)

      if (isFileDoc) {
        await conn.sendMessage(m.chat, {
          document: { url: mediaUrl },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          video: { url: mediaUrl },
          caption
        }, { quoted: m })
      }
    }

    await m.react('✅')
  } catch (e) {
    console.log('AutoDL Error:', e)
    await m.react('❌')
  }
}

export default handler
