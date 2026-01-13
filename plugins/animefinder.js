/*
* Nama fitur : Animefinder
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6chx1LI8YVtJJJ9a0Y
* Author : ZenzzXD
*/

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) throw new Error(`reply gambar dengan command .animefinder`)

    m.reply('wett')

    let media = await q.download()
    let tmpFile = `./tmp-${Date.now()}.jpg`
    fs.writeFileSync(tmpFile, media)

    let data = new FormData()
    data.append('image', fs.createReadStream(tmpFile))

    const api = await axios.post('https://www.animefinder.xyz/api/identify', data, {
      headers: {
        ...data.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'dnt': '1',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://www.animefinder.xyz',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://www.animefinder.xyz/',
        'accept-language': 'id,en-US;q=0.9,en;q=0.8,ja;q=0.7',
        'priority': 'u=1, i'
      }
    })

    let res = api.data
    let teks = `*Judul :* ${res.animeTitle || '-'}
*Karakter :* ${res.character || '-'}
*Deskripsi :* ${res.description || '-'}
*Genre :* ${res.genres || '-'}
*Studio :* ${res.productionHouse || '-'}
*Tayang :* ${res.premiereDate || '-'}

*Sinopsis :*
${res.synopsis || '-'}`

    m.reply(teks)
    fs.unlinkSync(tmpFile)
  } catch (err) {
    m.reply(`Eror kak : ${err.message}`)
  }
}

handler.command = ['animefinder']
handler.help = ['animefinder']
handler.tags = ['tools']

export default handler
