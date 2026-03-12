// ig audio 
// creator: Hilman
// source scrape : https://whatsapp.com/channel/0029VayWzSe9xVJkBl9vzG3S/2148

import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} https://www.instagram.com/reel/xxxxx/`

  await m.react('🕒')

  try {
    let { data } = await axios.post(
      'https://reelsvideo.io/reel/',
      new URLSearchParams({
        id: text,
        locale: 'id',
        'cf-turnstile-response': '',
        tt: 'a66b23d8bfa4878536d788ac3d33d1a6',
        ts: Math.floor(Date.now() / 1000)
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'HX-Request': 'true',
          'HX-Trigger': 'main-form',
          'HX-Target': 'target',
          'HX-Current-URL': 'https://reelsvideo.io/id',
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://reelsvideo.io/id'
        }
      }
    )

    const $ = cheerio.load(data)
    const mp3Link = $('a.type_audio').attr('href')

    if (!mp3Link) throw 'Audio tidak tersedia di reel ini.'

    await conn.sendMessage(m.chat, {
      audio: { url: mp3Link },
      mimetype: 'audio/mpeg'
    }, { quoted: global.fstatus })

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Gagal mengambil audio Instagram.')
  }
}

handler.help = ['igaudio <url>', 'igmp3 <url>']
handler.tags = ['downloader']
handler.command = /^(igaudio|igmp3)$/i
handler.limit = true

export default handler
