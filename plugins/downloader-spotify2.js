import axios from "axios"
import crypto from "crypto"

const spotifyTrackDownloader = async (spotifyTrackUrl) => {
  const client = new axios.create({
    baseURL: 'https://spotisongdownloader.to',
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
      'cookie': `PHPSESSID=${crypto.randomBytes(16).toString('hex')}; _ga=GA1.1.2675401.${Math.floor(Date.now()/1000)}`,
      'referer': 'https://spotisongdownloader.to',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const { data: meta } = await client.get('/api/composer/spotify/xsingle_track.php', { params: { url: spotifyTrackUrl } })
  await client.post('/track.php')
  const { data: dl } = await client.post('/api/composer/spotify/ssdw23456ytrfds.php', {
    url: spotifyTrackUrl,
    zip_download: "false",
    quality: "m4a"
  })
  return {...dl, ...meta}
}

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return m.reply('*Example :* .spotify2 https://open.spotify.com/track/5ljSDO6UpH02bQllrMR4Al?si=FTVovKgRQf6kXt_04eNCAA')
    let result = await spotifyTrackDownloader(args[0])
    let text = `*${result.song_name}*
    
*Artist :* ${result.artist}
*Album :* ${result.album_name}
*Duration :* ${result.duration}
*Release :* ${result.released}
*Link :* ${result.url}

> Send Audio Please Wait...`
    if (result.img) {
      await conn.sendMessage(m.chat, { image: { url: result.img }, caption: text }, { quoted: m })
    } else {
      await m.reply(text)
    }
    await conn.sendMessage(m.chat, { audio: { url: result.dlink }, mimetype: 'audio/mpeg' }, { quoted: m })
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['spotify2 <url>']
handler.command = ['spotify2']
handler.tags = ['downloader']
handler.limit = false

export default handler