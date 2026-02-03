import axios from 'axios'
import FormData from 'form-data'
async function Uguu(buffer, filename) {
const form = new FormData()
form.append('files[]', buffer, { filename })
const { data } = await axios.post('https://uguu.se/upload.php', form, {
headers: form.getHeaders(),
})
if (data.files && data.files[0]) {
return data.files[0].url
} else {
throw new Error('Upload gagal.')
}
}
let handler = async (m, { conn }) => {
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
if (!mime || !mime.startsWith('image/'))
throw 'Silakan kirim atau reply *gambar* untuk diubah ke teks.'
let media = await q.download()
let ext = mime.split('/')[1]
let filename = `ocr.${ext}`
let imageUrl = await Uguu(media, filename)
let { data } = await axios.get(`https://www.abella.icu/ocr?imageUrl=${encodeURIComponent(imageUrl)}`)
if (data?.status !== 'success') throw 'OCR gagal, coba lagi nanti.'
let hasil = data.data?.extractedText || 'Tidak ada teks yang berhasil diekstrak'
m.reply(hasil.replace(/\r/g, ''))
} catch (err) {
m.reply(`${err}`)
}
}
handler.command = ['ocr']
handler.tags = ['tools']
handler.help = ['ocr']
export default handler