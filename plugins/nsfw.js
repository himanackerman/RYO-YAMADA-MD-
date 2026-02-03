import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let api = 'https://www.sankavolereii.my.id/random/nsfw?apikey=planaai'
  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '⏳',
        key: m.key
      }
    })

    let res = await fetch(api)
    let contentType = res.headers.get('content-type')

    if (!contentType) throw '❌ Tidak bisa membaca Content-Type.'

    if (contentType.includes('application/json')) {
      let json = await res.json()
      let mediaURL = json.result

      if (!mediaURL) throw '❌ Tidak bisa ambil URL media.'

      // Deteksi ekstensi dari URL saja
      if (mediaURL.endsWith('.jpg') || mediaURL.endsWith('.jpeg') || mediaURL.endsWith('.png') || mediaURL.endsWith('.gif')) {
        await conn.sendFile(m.chat, mediaURL, 'nsfw.jpg', '*Random NSFW Image 🔞*', m)
      } else if (mediaURL.endsWith('.mp4') || mediaURL.endsWith('.webm') || mediaURL.endsWith('.mov')) {
        await conn.sendFile(m.chat, mediaURL, 'nsfw.mp4', '*Random NSFW Video 🔞*', m)
      } else {
        throw '❌ Format media tidak dikenali dari URL.'
      }

    } else if (contentType.startsWith('image/') || contentType.startsWith('video/')) {
      let buffer = await res.buffer()

      if (contentType.startsWith('image/')) {
        await conn.sendFile(m.chat, buffer, 'nsfw.jpg', '*Random NSFW Image 🔞*', m)
      } else if (contentType.startsWith('video/')) {
        await conn.sendFile(m.chat, buffer, 'nsfw.mp4', '*Random NSFW Video 🔞*', m)
      } else {
        throw '❌ Media langsung tapi format tidak dikenali.'
      }

    } else {
      throw `❌ Response tidak dikenali: ${contentType}`
    }

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, e.toString(), m)
    await conn.sendMessage(m.chat, {
      react: {
        text: '❌',
        key: m.key
      }
    })
  }
}

handler.help = ['nsfw']
handler.tags = ['nsfw']
handler.command = /^nsfw$/i
handler.limit = true
handler.premium = true

export default handler