import { fileTypeFromBuffer } from 'file-type'

async function ihancer(buffer) {
   if (!Buffer.isBuffer(buffer))
      throw new TypeError('Invalid input, must be buffer')

   const check = await fileTypeFromBuffer(buffer)
   if (!check?.mime || !check.mime.startsWith('image'))
      throw new TypeError('File harus berupa gambar')

   const form = new FormData()
   const blob = new Blob([buffer], { type: check.mime })

   form.append('method', '1')
   form.append('is_pro_version', 'false')
   form.append('is_enhancing_more', 'false')
   form.append('max_image_size', 'high')
   form.append('file', blob, `image.${check.ext}`)

   const res = await fetch('https://ihancer.com/api/enhance', {
      method: 'POST',
      headers: {
         'Accept-Encoding': 'gzip',
         'User-Agent': 'Dart/3.5 (dart:io)'
      },
      body: form
   })

   if (!res.ok) throw new Error('Gagal enhance')

   return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { conn }) => {
   let q = m.quoted ? m.quoted : m
   let mime = (q.msg || q).mimetype || ''

   if (!mime.startsWith('image/')) throw 'Reply gambar dengan command .hd2'

   let media = await q.download()
   await m.reply('⏳ Processing...')

   try {
      let result = await ihancer(media)

      await conn.sendFile(m.chat, result, 'hd.jpg', '✨ Done HD', m)
   } catch (e) {
      console.error(e)
      throw 'Gagal enhance gambar'
   }
}

handler.help = ['hd2']
handler.tags = ['tools']
handler.command = /^hd2$/i
handler.limit = true

export default handler