import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
    if (!text || !text.trim()) throw 'Masukkan teks yang valid!'
m.react('🕐')
    try {
        let url = `https://vapis.my.id/api/bratv1?q=${encodeURIComponent(text.trim())}`
        let res = await fetch(url)
        if (!res.ok) throw `Gagal mengambil gambar dari API! Status: ${res.status}`

        let imageBuffer = await res.buffer()
        let stiker = await sticker(imageBuffer)

        await conn.sendFile(m.chat, stiker, null, { asSticker: true }, m)
    } catch (err) {
        console.error('Error:', err.message || err)
        await conn.sendMessage(m.chat, { text: `Error: ${err.message || 'Gagal mengambil gambar.'}` }, { quoted: m })
    }
}

handler.help = ['brat2']
handler.tags = ['sticker']
handler.command = /^(brat2)$/i
handler.limit = true

export default handler