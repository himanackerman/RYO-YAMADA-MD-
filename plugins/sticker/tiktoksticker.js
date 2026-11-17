import { sticker, addExif } from '../../lib/core/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const urlRegex = /https?:\/\/(?:www\.|v[mt]\.|vt\.)?tiktok\.com\/[^\s]+/i
  const match = (text || '').match(urlRegex)

  if (!match) {
    return m.reply(`Contoh:\n${usedPrefix + command} https://vm.tiktok.com/ZSpgb8sNA/ [jumlah]`)
  }

  const targetUrl = match[0]
  const remaining = (text || '').replace(targetUrl, '').trim()
  const countMatch = remaining.match(/\b\d+\b/)
  const requestedCount = countMatch ? Math.min(Math.max(parseInt(countMatch[0], 10), 1), 20) : 10

  await m.react('🕒')

  try {
    const baseUrl = global.APIs?.xrina || 'https://apiii-xrina.my.id'
    const res = await fetch(
      `${baseUrl}/search/sticker-tiktok?url=${encodeURIComponent(targetUrl)}&limit=20&pages=20`,
      {
        signal: AbortSignal.timeout(20000),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    )

    if (!res.ok) {
      await m.react('❌')
      return m.reply(`❌ Gagal mengambil data (HTTP ${res.status})`)
    }

    const data = await res.json()

    if (!data?.status || !data?.data?.stickers?.length) {
      await m.react('❌')
      return m.reply('❌ Tidak ada stiker yang ditemukan di komentar video TikTok tersebut.')
    }

    const stickers = data.data.stickers
    const video = data.data.video || {}
    const authorName = video.author ? `TikTok @${video.author}` : 'TikTok'
    const packAuthor = global.packname || 'ʜɪʟᴍᴀɴ'

    const unique = []
    const seen = new Set()

    for (const item of stickers) {
      const id = item.sticker?.sticker_id || item.sticker?.sticker_url
      if (id && !seen.has(id)) {
        seen.add(id)
        unique.push(item)
      }
    }

    if (!unique.length) {
      await m.react('❌')
      return m.reply('❌ Stiker kosong.')
    }

    const candidateItems = unique.slice(0, Math.min(unique.length, requestedCount + 5))

    const preparedList = (
      await Promise.all(
        candidateItems.map(async item => {
          try {
            const url =
              item.sticker?.sticker_url ||
              item.sticker?.animated_url ||
              item.sticker?.static_url

            if (!url) return null

            const imgRes = await fetch(url, {
              signal: AbortSignal.timeout(10000)
            })

            if (!imgRes.ok) return null

            const rawData = await imgRes.arrayBuffer()
            let buf = Buffer.from(rawData)
            if (buf.length > 1500000) return null

            if (
              buf.length >= 12 &&
              buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
              buf.subarray(8, 12).toString('ascii') === 'WEBP'
            ) {
              return await addExif(buf, authorName, packAuthor).catch(() => buf)
            } else {
              return await sticker(buf, false, authorName, packAuthor).catch(() => null)
            }
          } catch {
            return null
          }
        })
      )
    ).filter(Boolean)

    const finalStickers = preparedList.slice(0, requestedCount)

    if (!finalStickers.length) {
      await m.react('❌')
      return m.reply('❌ Gagal menyiapkan stiker (mungkin ukuran stiker terlalu besar).')
    }

    for (let i = 0; i < finalStickers.length; i++) {
      await conn.sendMessage(m.chat, { sticker: finalStickers[i] }, { quoted: m })
      if (i < finalStickers.length - 1) {
        await new Promise(r => setTimeout(r, 400))
      }
    }

    await m.react('✅')
  } catch (e) {
    console.error('TikTok Sticker Error:', e)
    await m.react('❌')
    m.reply(`❌ Gagal mengambil stiker TikTok: ${e?.message || e}`)
  }
}

handler.help = ['stickertiktok <link tiktok>', 'ttsticker <link tiktok>']
handler.tags = ['sticker', 'downloader']
handler.command = /^(stickertiktok|tiktoksticker|ttsticker|stiktiktok)$/i
handler.limit = true

export default handler
