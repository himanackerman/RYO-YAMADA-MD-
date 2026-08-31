import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://api.sansekai.my.id/api/anime/latest')
    const data = await res.json()

    if (!data.length) throw 'Anime tidak ditemukan.'

    let teks = `🎌 *ANIME TERBARU*\n\n`

    data.forEach((anime, i) => {
      teks += `*${i + 1}. ${anime.judul}*\n`
      teks += `📺 Episode : ${anime.lastch}\n`
      teks += `🕒 Update  : ${anime.lastup}\n`
      teks += `🔗 Link    : https://sansekai.my.id/anime/${anime.url}\n\n`
    })

    await conn.sendFile(
      m.chat,
      data[0].cover,
      'anime.jpg',
      teks,
      m
    )

  } catch (e) {
    m.reply('❌ Gagal mengambil data anime terbaru')
  }
}

handler.help = ['animelatest']
handler.tags = ['anime']
handler.command = /^(animelatest|latestanime)$/i
handler.limit = true

export default handler