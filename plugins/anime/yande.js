/*
 * Fitur  : Yande Wallpaper
 * Base   : yande.re
 * Author : Hilman
 */

import axios from 'axios'

const API = 'https://yande.re/post.json'

async function randomYande() {
  const { data } = await axios.get(API, {
    params: {
      tags: 'order:random',
      limit: 1
    }
  })
  return data[0]
}

async function searchYande(tags) {
  const { data } = await axios.get(API, {
    params: { tags, limit: 5 }
  })
  return data
}

async function getById(id) {
  const { data } = await axios.get(API, {
    params: { tags: `id:${id}` }
  })
  return data[0]
}

async function sendImage(conn, m, img) {
  await conn.sendMessage(m.chat, {
    image: { url: img.file_url },
    caption:
`Size : ${img.width}x${img.height}
Rating : ${img.rating}
ID : ${img.id}`,
    footer: 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ',

    nativeFlow: [
      {
        text: 'Lagi',
        id: '.yande random'
      }
    ]

  }, { quoted: m })
}

let handler = async (m, { conn, args }) => {
  try {

    if (!args[0]) {
      const img = await randomYande()
      return sendImage(conn, m, img)
    }

    if (args[0] === 'random') {
      const img = await randomYande()
      return sendImage(conn, m, img)
    }

    if (args[0] === 'id') {
      if (!args[1]) return m.reply('Masukkan ID')
      const img = await getById(args[1])
      return sendImage(conn, m, img)
    }

    const query = args.join('_')
    m.reply('Mencari wallpaper...')

    const results = await searchYande(query)
    if (!results.length) return m.reply('Tidak ditemukan')

    for (let img of results) {
      await sendImage(conn, m, img)
    }

  } catch (e) {
    console.log(e)
    m.reply('Gagal mengambil wallpaper')
  }
}

handler.command = /^yande$/i
handler.help = ['yande']
handler.tags = ['anime']
handler.limit = true

export default handler