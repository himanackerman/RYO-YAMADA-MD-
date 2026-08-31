/**
 * IQCV2 Fake Chat iPhone
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API    : https://brat.siputzx.my.id/
 */

import axios from 'axios'
import FormData from 'form-data'

async function uploadUguu(buffer) {
  let form = new FormData()
  form.append('files[]', buffer, 'image.jpg')

  const { data } = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders()
  })

  return data.files[0].url
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted
  let mime = (q?.mimetype || m.mimetype || '')

  if (!text && !/image/.test(mime)) {
    return m.reply(`✨ Kirim gambar atau reply + caption

Contoh:
${usedPrefix + command} halo cihuyy`)
  }

  let imageUrl

  if (/image/.test(mime)) {
    let media = await (q ? q.download() : m.download())
    imageUrl = await uploadUguu(media)
  }

  let message = text?.trim() || ' '

  await m.reply("✨ waitt")

  try {
    const json = {
      sender: "other",
      message,
      imageUrl,
      timestamp: "21.02",
      time: "21.02",
      status: {
        carrierName: "INDOSAT",
        batteryPercentage: 88,
        signalStrength: 4,
        wifi: true
      },
      backgroundUrl: "",
      readStatus: true,
      emojiStyle: "apple"
    }

    const res = await axios.post(
      'https://brat.siputzx.my.id/v2/iphone-quoted',
      json,
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'arraybuffer'
      }
    )

    let buffer = Buffer.from(res.data)
    let url = await uploadUguu(buffer)

    await conn.sendMessage(m.chat, {
      image: { url }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '❌ Gagal proses!'
  }
}

handler.help = ['iqcv2']
handler.tags = ['tools']
handler.command = /^iqcv2$/i
handler.limit = true
handler.register = true

export default handler