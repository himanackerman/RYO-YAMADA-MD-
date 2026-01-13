import axios from 'axios'
import crypto from 'crypto'

const k = {
  enc: "GJvE5RZIxrl9SuNrAtgsvCfWha3M7NGC",
  dec: "H3quWdWoHLX5bZSlyCYAnvDFara25FIu"
}

const cryptoProc = (type, data) => {
  const key = Buffer.from(k[type])
  const iv = Buffer.from(k[type].slice(0, 16))
  const cipher = (type === 'enc'
    ? crypto.createCipheriv
    : crypto.createDecipheriv)('aes-256-cbc', key, iv)
  let result = cipher.update(
    data,
    ...(type === 'enc'
      ? ['utf8', 'base64']
      : ['base64', 'utf8'])
  )
  result += cipher.final(type === 'enc' ? 'base64' : 'utf8')
  return result
}

async function tiktokDl(url) {
  if (!/tiktok\.com/.test(url)) throw 'URL tidak valid.'
  const { data } = await axios.post(
    'https://savetik.app/requests',
    { bdata: cryptoProc('enc', url) },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 16; Mobile; SM-D639N; rv:130.0) Gecko/130.0 Firefox/130.0',
        'Content-Type': 'application/json'
      }
    }
  )
  if (!data || data.status !== 'success') throw 'Gagal mengambil data TikTok.'
  return { audio: data.mp3 }
}

let handler = async (m, { conn, args, command }) => {
  await m.react('✨')

  const url = args[0] || (m.quoted && m.quoted.text)
  if (!url) throw `Kirim URL TikTok!\nContoh:\n.${command} https://www.tiktok.com/...`

  try {
    const res = await tiktokDl(url)
    if (!res.audio) throw 'Audio tidak ditemukan.'

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: res.audio },
        mimetype: 'audio/mp4',
        fileName: 'tiktok_audio.mp3',
        ptt: false
      },
      { quoted: global.fkontak }
    )

  } catch (e) {
    throw `❌ Error: ${e}`
  }
}

handler.help = ['ttmp3', 'ttmusic']
handler.tags = ['downloader']
handler.command = /^(ttmp3|ttmusic)$/i
handler.limit = true

export default handler