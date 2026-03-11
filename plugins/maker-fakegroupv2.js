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
${usedPrefix + command} url|name|members|desc|author|date
Reply gambar:
${usedPrefix + command} name|members|desc|author|date

Contoh cepat:
${usedPrefix}fakegroupv2 Elaina|500|Grup ytta|Hilman|06/03/26 15:31`
  }

  await m.react('🕒')

  try {
    let url, name, members, desc, author, date
    let args = text.split('|').map(v => v?.trim())

    if (args.length === 6) {
      [url, name, members, desc, author, date] = args
    } else if (args.length === 5) {
      if (!mime.startsWith('image/')) {
        throw 'Reply atau kirim gambar untuk foto grup.'
      }
      ;[name, members, desc, author, date] = args
      let media = await q.download()
      url = await uguu(media)
      if (!url) throw 'Gagal upload gambar.'
    } else {
      throw `Format salah.
Contoh:
${usedPrefix}fakegroupv2 Elaina|500|Grup ytta|Hilman|06/03/26 15:31`
    }

    let api = `https://api.zenzxz.my.id/maker/fakegroupv2?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&members=${encodeURIComponent(members)}&desc=${encodeURIComponent(desc)}&author=${encodeURIComponent(author)}&date=${encodeURIComponent(date)}`

    let { data } = await axios.get(api, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(data)

    await conn.sendMessage(m.chat, {
      image: buffer
    }, { quoted: global.fstatus })

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Gagal membuat fake group v2.')
  }
}

handler.help = ['fakegroupv2']
handler.tags = ['maker']
handler.command = /^fakegroupv2$/i
handler.limit = true

export default handler