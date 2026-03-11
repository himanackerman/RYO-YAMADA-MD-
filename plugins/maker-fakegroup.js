import axios from 'axios'
import FormData from 'form-data'

async function uguu(buffer) {
  try {
    const form = new FormData()
    form.append("files[]", buffer, "image.jpg")

    const { data } = await axios.post(
      "https://uguu.se/upload",
      form,
      { headers: form.getHeaders() }
    )

    return data?.files?.[0]?.url || null
  } catch {
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!text) {
    throw `Contoh:
${usedPrefix + command} url|title|number|time
Reply gambar:
${usedPrefix + command} title|number|time`
  }

  await m.react('🕒')

  try {
    let url, title, number, time

    let args = text.split('|').map(v => v?.trim())

    if (args.length === 4) {
      [url, title, number, time] = args
    } else if (args.length === 3) {
      if (!mime.startsWith('image/')) {
        throw 'Reply atau kirim gambar untuk dijadikan foto grup.'
      }
      ;[title, number, time] = args
      let media = await q.download()
      url = await uguu(media)
      if (!url) throw 'Gagal upload gambar.'
    } else {
      throw `Format salah.
${usedPrefix + command} url|title|number|time`
    }

    let api = `https://api.zenzxz.my.id/maker/fakegroup?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&number=${encodeURIComponent(number)}&time=${encodeURIComponent(time)}`

    let { data } = await axios.get(api, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(data)

    await conn.sendMessage(m.chat, {
      image: buffer
    }, { quoted: global.fstatus })

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Gagal membuat fake group.')
  }
}

handler.help = ['fakegroup']
handler.tags = ['maker']
handler.command = /^fakegroup$/i
handler.limit = true

export default handler