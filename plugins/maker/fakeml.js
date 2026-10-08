import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { conn, text, usedPrefix }) => {
  const quotedImage =
    m.quoted &&
    /image/i.test(m.quoted.mtype || m.quoted.type || '')

  const directImage =
    m.mtype === 'imageMessage' ||
    m.type === 'imageMessage' ||
    m.message?.imageMessage

  if (!quotedImage && !directImage) {
    throw `*FAKE LOBBY ML*

Cara pakai:

Reply gambar:
*${usedPrefix}fakeml NamaKamu*

Atau kirim gambar langsung dengan caption:
*${usedPrefix}fakeml NamaKamu*

Contoh:
*${usedPrefix}fakeml elaina*`
  }

  const nickname = text?.trim()

  if (!nickname) {
    throw `Nickname tidak boleh kosong!

Contoh:
*${usedPrefix}fakeml elaina*`
  }

  try {
    let imageBuffer

    if (quotedImage) {
      imageBuffer = await m.quoted.download()
    } else {
      imageBuffer = await m.download()
    }

    if (!imageBuffer) {
      throw new Error('Gagal mengambil gambar')
    }

    const form = new FormData()

    form.append('files[]', imageBuffer, {
      filename: 'avatar.jpg',
      contentType: 'image/jpeg'
    })

    const { data } = await axios.post(
      'https://uguu.se/upload.php',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    )

    const imageUrl = data?.files?.[0]?.url

    if (!imageUrl) {
      throw new Error('Gagal upload gambar ke Uguu')
    }

    const url =
      `https://api.nexray.eu.cc/maker/fakelobyml` +
      `?avatar=${encodeURIComponent(imageUrl)}` +
      `&nickname=${encodeURIComponent(nickname)}`

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    const result = Buffer.from(response.data)
    const contentType = response.headers['content-type'] || ''

    if (!contentType.startsWith('image/') || result.length <= 1000) {
      throw new Error('API Nexray tidak mengembalikan gambar yang valid')
    }

    await conn.sendMessage(
      m.chat,
      {
        image: result,
        caption: `— fake lobby ml —

❀ nickname :
${nickname}`
      },
      { quoted: m }
    )
  } catch (e) {
    console.error('FAKEML ERROR:', e)

    throw `Gagal membuat Fake Lobby ML.

Error:
${e.message || e}`
  }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['maker']
handler.command = /^fakeml$/i
handler.limit = true
handler.register = false

export default handler