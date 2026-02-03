import axios from "axios"

async function lyrics(title) {
  try {
    if (!title) throw new Error('Judul lagu diperlukan!')
    const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
      headers: {
        referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    })
    return data
  } catch (err) {
    throw new Error(err.message)
  }
}

let handler = async (m, { text }) => {
  if (!text) throw 'Masukkan judul lagu!\n\nContoh: .lyrics bunga maaf'
  try {
    let res = await lyrics(text)
    if (!res || !res.length) throw 'Lirik tidak ditemukan!'

    let song = res[0]
    let hasil = `🎵 *Lyrics Finder*

*Judul:* ${song.trackName || '-'}
*Artis:* ${song.artistName || '-'}
*Album:* ${song.albumName || '-'}

📑 *Lirik:*
${song.plainLyrics || 'Tidak ada lirik tersedia.'}`

    m.reply(hasil)
  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['lyrics <judul>']
handler.tags = ['internet']
handler.command = /^lyrics|lirik$/i
handler.limit = false

export default handler