/**
 * Spotify play 
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://api.nexray.web.id
 */
 
import axios from 'axios'

function formatNumber(num) {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} Payung Teduh Mari Bercerita`

  await m.react('🕒')

  try {
    let api = `https://api.nexray.web.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`
    let { data } = await axios.get(api)

    if (!data.status) throw 'Lagu tidak ditemukan'

    let v = data.result

    let caption = `
✦━━━「 Spotify Play 」━━━✦
🎧 Title   : ${v.title}
🎤 Artist  : ${v.artist}

💿 Album   : ${v.album}
🕰️ Duration: ${v.duration}
🔥 Popular : ${formatNumber(v.popularity)}

📅 Release : ${v.release_at}
✦━━━━━━━━━━━━━━━━━━━━✦
`.trim()

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: v.title,
          body: v.artist,
          thumbnailUrl: v.thumbnail,
          sourceUrl: v.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: { url: v.download_url },
      mimetype: 'audio/mpeg',
      fileName: v.title + '.mp3'
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Gagal mengambil lagu')
  }
}

handler.help = ['spotifyplay', 'spplay']
handler.tags = ['downloader']
handler.command = /^(spotifyplay|spplay)$/i
handler.limit = true

export default handler
