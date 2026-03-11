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
${usedPrefix + command} url|name|followers|desc|date
Reply gambar:
${usedPrefix + command} name|followers|desc|date

Contoh cepat:
${usedPrefix}fakech hilman ytta|2,1M|anu|20/06/26`
  }

  await m.react('🕒')

  try {
    let url, name, followers, desc, date
    let args = text.split('|').map(v => v?.trim())

    if (args.length === 5) {
      [url, name, followers, desc, date] = args
    } else if (args.length === 4) {
      if (!mime.startsWith('image/')) {
        throw 'Reply atau kirim gambar untuk foto channel.'
      }
      ;[name, followers, desc, date] = args
      let media = await q.download()
      url = await uguu(media)
      if (!url) throw 'Gagal upload gambar.'
    } else {
      throw `Format salah.
Contoh:
${usedPrefix}fakech hilman ytta|2,1M|anu|20/06/26`
    }

    let api = `https://api.zenzxz.my.id/maker/fakechannel?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&followers=${encodeURIComponent(followers)}&desc=${encodeURIComponent(desc)}&date=${encodeURIComponent(date)}`

    let { data } = await axios.get(api, { responseType: 'arraybuffer' })
    let buffer = Buffer.from(data)

    await conn.sendMessage(m.chat, {
      image: buffer
    }, { quoted: global.fstatus })

  } catch (e) {
    m.reply(typeof e === 'string' ? e : '❌ Gagal membuat fake channel.')
  }
}

handler.help = ['fakechannel <url|name|followers|desc|date>']
handler.tags = ['maker']
handler.command = /^(fakechannel|fakech)$/i
handler.limit = true

export default handler