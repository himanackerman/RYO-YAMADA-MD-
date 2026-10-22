let handler = async (m, { conn }) => {
  if (!m.quoted) throw '❌ Reply ke pesan view once!'

  let q = m.quoted

  // Pastikan yang direply adalah media view once
  let mime = (q.msg || q).mimetype || ''
  if (!mime) throw '❌ Itu bukan pesan media view once!'

  let media = await q.download() // download media
  if (!media) throw '❌ Gagal download media!'

  await conn.sendFile(m.chat, media, 'media.' + mime.split('/')[1], q.text || '', m)
}

handler.help = ['rvo']
handler.tags = ['tools']
handler.command = /^rvo$/i
handler.limit = true

export default handler