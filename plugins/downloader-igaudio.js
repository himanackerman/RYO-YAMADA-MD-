/* 
`[Instagram audio]`
type : plugins esm 
sumber scrape: 
https://whatsapp.com/channel/0029Vb5blhMEawdx2QFALZ1D/385
*/

import fetch from 'node-fetch'
import axios from 'axios'
import qs from 'querystring'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`Example: ${usedPrefix + command} https://www.instagram.com/reels/audio/183824252336459/`)

  let url = args[0]
  if (!/^https?:\/\/(www\.)?instagram\.com\/reels\/audio\/\d+/.test(url)) return m.reply('URL audio reels Instagram tidak valid.')

  try {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    }

    const home = await axios.get('https://saveinsta.to/')
    const k_token = home.data.match(/k_token\s*=\s*['"]([^'"]+)['"]/)?.[1]
    if (!k_token) throw '❌ Gagal ambil token'

    const verifyRes = await axios.post('https://saveinsta.to/api/userverify', qs.stringify({ url }), { headers })
    const cftoken = verifyRes.data?.token
    if (!cftoken) throw '❌ Token verifikasi tidak ditemukan'

    const payload = qs.stringify({
      k_exp: Math.floor(Date.now() / 1000) + 300,
      k_token,
      q: url,
      t: 'media',
      lang: 'en',
      v: 'v2',
      cftoken
    })

    const searchRes = await axios.post('https://saveinsta.to/api/ajaxSearch', payload, { headers })
    const html = searchRes.data?.data
    if (!html) throw '❌ Tidak ada hasil data'

    const rawLink = html.match(/<a href="([^"]+)"[^>]*title="Download Audio"/)?.[1]
    const filename = html.match(/"filename":"([^"]+\.mp4)"/)?.[1] || html.match(/\/([^\/?#]+\.mp4)/)?.[1]
    if (!rawLink) throw '❌ Link audio tidak ditemukan'

    const mp3Link = 'https://mp3.videodropper.app/api?url=' + encodeURIComponent(rawLink)

    await conn.sendMessage(m.chat, {
      audio: { url: mp3Link },
      mimetype: 'audio/mp4',
      fileName: filename || 'Fiony_Audio.mp4',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal download audio.\n' + e)
  }
}

handler.help = ['instaaudio', 'igaudio']
handler.tags = ['downloader']
handler.command = /(instaaudio|igaudio|inastagramaudio)$/i
handler.limit = true

export default handler