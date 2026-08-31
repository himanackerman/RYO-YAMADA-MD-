import { sticker } from '../../lib/sticker.js'
import { downloadContentFromMessage } from 'baileys'

function getMediaContent(obj) {
  if (!obj) return { mtype: '', content: {} }

  let mtype = obj.mtype || (obj.message ? Object.keys(obj.message)[0] : '')
  let content = obj.message?.[mtype] || obj.msg || obj

  if (
    ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'].includes(mtype) &&
    content?.message
  ) {
    const innerType = Object.keys(content.message)[0]
    mtype = innerType
    content = content.message[innerType] || {}
  }

  return { mtype, content }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const react = async (emoji) => {
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      })
    } catch {}
  }

  let [packname, ...authorArr] = args.join(' ').split('|')

  packname = packname || global.stickpack || 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'

  let author =
    authorArr.join('|') ||
    global.stickauth ||
    'ʙʏ ʜɪʟᴍᴀɴ'

  let q = m.quoted ? m.quoted : m
  const rawList = []

  const quotedId = m.quoted?.key?.id || m.quoted?.id

  if (quotedId && global.albumCache?.has(quotedId)) {
    rawList.push(
      ...(global.albumCache.get(quotedId)?.messages || [])
    )
  }

  if (rawList.length >= 2) {
    await react('🕒')

    try {
      await m.reply(
        `Ditemukan ${rawList.length} media, sedang diproses menjadi Sticker Pack...`
      )

      const stickers = []

      for (const item of rawList) {
        const { mtype, content } = getMediaContent(item)

        const mime = content?.mimetype || ''

        const isImage =
          mtype === 'imageMessage' ||
          mime.startsWith('image/')

        const isVideo =
          mtype === 'videoMessage' ||
          mime.startsWith('video/')

        if (!isImage && !isVideo) continue

        if (isVideo && content?.seconds > 15) continue

        let buffer = await item.download?.().catch(() => null)

        if (!buffer) {
          const type = mtype
            ? mtype.replace('Message', '')
            : 'image'

          const stream = await downloadContentFromMessage(
            content,
            type
          )

          buffer = Buffer.from([])

          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
          }
        }

        if (!buffer || !buffer.length) continue

        const webp = await sticker(
          buffer,
          false,
          packname,
          author
        )

        if (!webp || !Buffer.isBuffer(webp)) continue

        stickers.push({
          data: webp
        })
      }

      if (stickers.length === 0) {
        throw 'Gagal memproses media dalam album.'
      }

      await conn.sendMessage(
        m.chat,
        {
          cover: stickers[0].data,
          stickers,
          name: global.namebot,
          publisher: author,
          description: global.author
        },
        { quoted: m }
      )

      await react('✅')
      return
    } catch (e) {
      console.error('Sticker Pack error:', e)

      await react('❌')

      await m.reply(
        `❌ Gagal membuat sticker pack: ${e.message || e}`
      )

      return
    }
  }

  try {
    await react('🍓')

    let mime =
      (q.msg || q).mimetype ||
      q.mediaType ||
      ''

    if (!mime && q.message) {
      const type = Object.keys(q.message)[0]

      if (type === 'imageMessage') {
        mime = 'image/jpeg'
      }

      if (type === 'videoMessage') {
        mime = 'video/mp4'
      }
    }

    if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 10) {
        await react('❌')
        return m.reply('Maksimal 10 detik')
      }

      const img = await q.download?.()

      if (!img) {
        throw `Balas video dengan *${usedPrefix + command}*`
      }

      const stiker = await sticker(
        img,
        false,
        packname,
        author
      )

      if (!stiker) {
        throw 'Gagal membuat sticker'
      }

      await conn.sendMessage(
        m.chat,
        { sticker: stiker },
        { quoted: m }
      )

      await react('✨')
    } else if (/image/g.test(mime)) {
      const img = await q.download?.()

      if (!img) {
        throw `Balas gambar dengan *${usedPrefix + command}*`
      }

      const stiker = await sticker(
        img,
        false,
        packname,
        author
      )

      if (!stiker) {
        throw 'Gagal membuat sticker'
      }

      await conn.sendMessage(
        m.chat,
        { sticker: stiker },
        { quoted: m }
      )

      await react('✨')
    } else {
      await react('❌')

      m.reply(
        `Balas gambar/video dengan *${usedPrefix + command}*, atau kirim/reply *album* buat sticker pack.`
      )
    }
  } catch (e) {
    console.error(e)

    await react('❌')

    m.reply('❌ Terjadi kesalahan')
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.register = false

export default handler