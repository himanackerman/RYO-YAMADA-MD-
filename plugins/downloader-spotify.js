import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} https://open.spotify.com/track/xxxxx`)
  }

  if (!text.includes("spotify.com")) {
    return m.reply("Link Spotify tidak valid")
  }

  await m.react("🕒")

  try {

    const api = `https://x.0cd.fun/dl/spotify?url=${encodeURIComponent(text)}`
    const { data } = await axios.get(api)

    if (!data.status) throw "API error"

    const audio = data.data.media[0].url

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: audio },
        mimetype: "audio/mpeg"
      },
      { quoted: m }
    )

    await m.react("✅")

  } catch (e) {
    console.error(e)
    await m.react("❌")
    m.reply("Gagal download lagu Spotify.")
  }
}

handler.help = ['spotify <url>']
handler.tags = ['downloader']
handler.command = /^spotify$/i
handler.limit = true

export default handler
