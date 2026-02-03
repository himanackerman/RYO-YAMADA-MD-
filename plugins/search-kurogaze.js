// kurogaze ( search anime )
// plugin esm
import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { text }) => {
  if (!text) throw 'Masukkan judul anime yang ingin dicari!'

  let hasil = []

  for (let i = 1; i <= 5; i++) { 
    let url = `https://k.kurogaze.moe/page/${i}/?s=${encodeURIComponent(text)}&post_type=post`
    let { data } = await axios.get(url)
    let $ = cheerio.load(data)

    $('.artikel-post article').each((i, el) => {
      let title = $(el).find('h2.title a').text().trim()
      let link = $(el).find('h2.title a').attr('href')
      let thumb = $(el).find('.thumb img').attr('src')
      let score = $(el).find('.score').text().trim()

      hasil.push({ title, link, thumb, score })
    })

   
    if ($('.artikel-post article').length == 0) break
  }

  if (!hasil.length) throw 'Anime tidak ditemukan!'

  let teks = `🔍 *Hasil pencarian untuk:* ${text}\n\n`
  for (let i = 0; i < Math.min(10, hasil.length); i++) {
    let { title, link, score } = hasil[i]
    teks += `🎬 *${title}*\n📎 ${link}\n⭐️ Score: ${score || '-'}\n\n`
  }

  m.reply(teks)
}

handler.help = ['kurogaze <judul>']
handler.tags = ['anime', 'search']
handler.command = /^kurogaze$/i
handler.limit = true

export default handler