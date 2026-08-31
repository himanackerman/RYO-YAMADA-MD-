import sharp from 'sharp'
import axios from 'axios'
import FormData from 'form-data'

async function toWebp(buffer) {
  return await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer()
}

async function uploadUguu(buffer) {
  let form = new FormData()
  form.append('files[]', buffer, 'file.webp')

  let res = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders()
  })

  return res.data.files[0].url
}

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply('Reply gambar / sticker')

    let mime = m.quoted.mimetype || ''
    if (!/image|webp/.test(mime)) {
      return m.reply('Harus reply gambar atau sticker')
    }

    let media = await m.quoted.download()
    let webp = await toWebp(media)
    let url = await uploadUguu(webp)

    await conn.sendMessage(m.chat, {
      cover: { url },
      stickers: [
        { data: { url } }
      ],
      name: 'Ryo Yamada',
      publisher: 'Ryo Yamada',
      description: 'ytta acumalaka'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Error bikin sticker pack')
  }
}

handler.help = ['pack']
handler.tags = ['sticker']
handler.command = /^pack$/i

export default handler