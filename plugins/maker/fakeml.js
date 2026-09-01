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
*${usedPrefix}fakeml Hilman*`
  }

  const nickname = text?.trim()

  if (!nickname) {
    throw `Nickname tidak boleh kosong!

Contoh:
*${usedPrefix}fakeml Hilman*`
  }

  try {
    await m.react('🕒')

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

    const apis = [
      `https://api.nexray.eu.cc/maker/fakelobyml?avatar=${encodeURIComponent(imageUrl)}&nickname=${encodeURIComponent(nickname)}`,
      `https://api.ourin.my.id/api/fake-lobby-ml?avatar=${encodeURIComponent(imageUrl)}&nickname=${encodeURIComponent(nickname)}`,
      `${global.APIs.cuki}/api/maker/fakeml?apikey=${global.APIKeys[global.APIs.cuki]}&avatar=${encodeURIComponent(imageUrl)}&name=${encodeURIComponent(nickname)}`
    ]

    let result = null

    for (const url of apis) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          validateStatus: () => true
        })

        const buffer = Buffer.from(response.data)
        const contentType = response.headers['content-type'] || ''

        if (
          response.status >= 200 &&
          response.status < 300 &&
          contentType.startsWith('image/') &&
          buffer.length > 1000
        ) {
          result = buffer
          break
        }
      } catch {}
    }

    if (!result) {
      throw new Error('Semua API fake lobby ML gagal')
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

    await m.react('✅')
  } catch (e) {
    console.error('FAKEML ERROR:', e)

    await m.react('❌')

    throw `Gagal membuat Fake Lobby ML.

Error:
${e.message || e}`
  }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['maker']
handler.command = /^fakeml$/i
handler.limit = true
handler.register = true

export default handler