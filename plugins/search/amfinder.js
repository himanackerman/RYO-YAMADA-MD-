let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = (m.quoted ? m.quoted.text : text)?.trim() || ''
  const urlRegex = /https?:\/\/(?:www\.|v[mt]\.|vt\.)?tiktok\.com\/[^\s]+/i
  const match = input.match(urlRegex)

  if (!match) {
    return m.reply(`*Contoh Penggunaan:*\n${usedPrefix + command} https://vt.tiktok.com/ZSpqmFP7H/`)
  }

  const targetUrl = match[0]

  await m.react('🕒')

  try {
    const baseUrl = global.APIs?.xrina || 'https://apiii-xrina.my.id'
    const res = await fetch(
      `${baseUrl}/search/amfinder?url=${encodeURIComponent(targetUrl)}`,
      {
        signal: AbortSignal.timeout(25000),
        headers: { 'User-Agent': 'Mozilla/5.0' }
      }
    )

    if (!res.ok) {
      await m.react('❌')
      return m.reply(`❌ Gagal mengambil data (HTTP ${res.status})`)
    }

    const json = await res.json()

    if (!json?.status || !json?.data) {
      await m.react('❌')
      return m.reply('❌ Gagal memproses data TikTok.')
    }

    const { author, avatar, video, scanned, presetLinks } = json.data

    if (!presetLinks || !presetLinks.length) {
      await m.react('❌')
      let caption = `*\`ALIGHT MOTION PRESET FINDER\`*\n\n`
      caption += `✿ *Creator* : @${author || '-'}\n`
      caption += `✿ *Scanned* : ${scanned?.comments || 0} Komentar, ${scanned?.replies || 0} Balasan\n\n`
      caption += `❌ Tidak ditemukan link preset Alight Motion pada video TikTok tersebut.`
      return m.reply(caption)
    }

    let caption = `*\`ALIGHT MOTION PRESET FINDER\`*\n\n`
    caption += `✿ *Creator* : @${author || '-'}\n`
    caption += `✿ *Scanned* : ${scanned?.comments || 0} Komentar, ${scanned?.replies || 0} Balasan\n`
    caption += `✿ *Total Preset* : ${presetLinks.length} Ditemukan\n\n`

    presetLinks.forEach((p, i) => {
      caption += `┌─⊷ *PRESET ${i + 1}*\n`
      caption += `▢ *Judul* : ${p.title || '-'}\n`
      if (p.type) caption += `▢ *Tipe* : ${p.type.toUpperCase()}\n`
      if (p.size) caption += `▢ *Ukuran* : ${p.size}\n`
      caption += `▢ *Sumber* : ${p.source === 'comment' ? 'Komentar' : p.source || '-'}`
      if (p.detail) caption += ` (${p.detail})`
      caption += `\n`
      caption += `▢ *Link* : ${p.url}\n`
      caption += `└──────────────\n\n`
    })

    caption = caption.trim()

    const banner = presetLinks[0]?.thumb || avatar || null

    if (banner) {
      try {
        await conn.sendMessage(
          m.chat,
          {
            image: { url: banner },
            caption
          },
          { quoted: m }
        )
      } catch {
        await m.reply(caption)
      }
    } else {
      await m.reply(caption)
    }

    await m.react('✅')
  } catch (e) {
    console.error('AM Finder Error:', e)
    await m.react('❌')
    m.reply(`❌ Terjadi kesalahan: ${e?.message || e}`)
  }
}

handler.help = ['amfinder <link tiktok>', 'presetam <link tiktok>']
handler.tags = ['search', 'downloader']
handler.command = /^(amfinder|presetam|ampreset|caripreset)$/i
handler.limit = true

export default handler
