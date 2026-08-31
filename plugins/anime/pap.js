const handler = async (m, { conn }) => {
  try {
    const res = await fetch(
      'https://api.github.com/repos/himanackerman/Image/contents/Ryo%20Yamada'
    )

    if (!res.ok) throw `HTTP ${res.status}`

    const data = await res.json()

    const images = data.filter(
      file =>
        file.type === 'file' &&
        /\.(jpg|jpeg|png|webp)$/i.test(file.name) &&
        file.download_url
    )

    if (!images.length) throw 'Tidak ada gambar ditemukan'

    const result =
      images[Math.floor(Math.random() * images.length)]

    await new AIRich(conn)
      .addImage(result.download_url)
      .send(m.chat, { quoted: m })

  } catch (e) {
    console.error(e)
    throw `Error: ${e}`
  }
}

handler.help = ['pap']
handler.tags = ['anime']
handler.command = /^(pap)$/i
handler.limit = false

export default handler