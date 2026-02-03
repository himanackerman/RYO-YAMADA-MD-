import fetch from 'node-fetch'

let handler = async (m, { command }) => {
  try {
    let url = ''

    switch (command) {
      case 'cnn': url = API('lol', '/api/news/cnn'); break
      case 'cnn-ekonomi': url = API('lol', '/api/news/cnn/ekonomi'); break
      case 'cnn-hiburan': url = API('lol', '/api/news/cnn/hiburan'); break
      case 'cnn-internasional': url = API('lol', '/api/news/cnn/internasional'); break
      case 'cnn-nasional': url = API('lol', '/api/news/cnn/nasional'); break
      case 'cnn-olahraga': url = API('lol', '/api/news/cnn/olahraga'); break
      case 'cnn-social': url = API('lol', '/api/news/cnn/social'); break
      case 'cnn-teknologi': url = API('lol', '/api/news/cnn/teknologi'); break
      case 'detik': url = API('lol', '/api/news/detik'); break
      case 'jalantikus': url = API('lol', '/api/news/jalantikus'); break
      case 'kumparan': url = API('lol', '/api/news/kumparan'); break
      case 'liputan6': url = API('lol', '/api/news/liputan6'); break
      case 'republika': url = API('lol', '/api/news/republika'); break
      case 'nasional': url = API('lol', '/api/news'); break
    }

    let res = await fetch(url)
    let json = await res.json()

    if (!json.result || !json.result.length) {
      return m.reply('Berita tidak ditemukan')
    }

    let berita = json.result.slice(0, 5)
    let teks = '📰 *Berita Terbaru*\n\n'

    for (let b of berita) {
      teks += `• *${b.title}*\n${b.link}\n\n`
    }

    m.reply(teks.trim())

  } catch (e) {
    m.reply('Gagal mengambil berita dari Lolhuman')
  }
}

handler.help = [
  'cnn','cnn-ekonomi','cnn-hiburan','cnn-internasional',
  'cnn-nasional','cnn-olahraga','cnn-social','cnn-teknologi',
  'detik','jalantikus','kumparan','liputan6','republika','nasional'
]

handler.tags = ['internet']

handler.command = /^(cnn|cnn-ekonomi|cnn-hiburan|cnn-internasional|cnn-nasional|cnn-olahraga|cnn-social|cnn-teknologi|detik|jalantikus|kumparan|liputan6|republika|nasional)$/i

handler.limit = true
export default handler