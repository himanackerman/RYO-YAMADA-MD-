import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) return m.reply('✨ Reply/kirim file yang mau diupload.')

  try {
    await m.react('✨')

    let buffer = await q.download()
    if (!buffer) throw 'Gagal download media'

    let ext = mime.split('/')[1] || 'bin'
    let filename = `upload_${Date.now()}.${ext}`

    const form = new FormData()
    form.append('file', buffer, filename)

    const { data } = await axios.post(
      'https://cdn.nekohime.site/upload',
      form,
      { headers: form.getHeaders() }
    )

    if (!data?.files?.length) throw 'Upload gagal'

    let url = data.files[0].url || data.files[0]

    await new Button(conn)
      .setBody(`✨ *Berhasil Upload ke CDN!*\n\n✨ ${url}`)
      .addCopy('✨ Salin URL', url, { icon: 'DOCUMENT' })
      .send(m.chat, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('✨ Gagal upload ke CDN.')
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^tourl$/i
handler.limit = false
handler.register = false

export default handler
                             
