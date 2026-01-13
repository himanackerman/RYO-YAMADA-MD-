import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || ''

        if (!text && !/image\/(jpe?g|png|webp)/.test(mime)) {
            return m.reply(`*Contoh:* ${usedPrefix + command} (link gambar)\n*Atau reply gambarnya.*`)
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let imageUrl = text

        // ======== Jika user reply gambar ========
        if (/image\/(jpe?g|png|webp)/.test(mime)) {
            let media = await q.download()

            let form = new FormData()
            form.append('files[]', media, { filename: 'upload.' + mime.split('/')[1] })

            let upload = await axios.post('https://uguu.se/upload.php', form, {
                headers: form.getHeaders()
            })

            imageUrl = upload.data.files?.[0]?.url
            if (!imageUrl) throw 'Gagal upload ke Uguu!'
        }

        if (!imageUrl) return m.reply(`*🍂 Gambar tidak ditemukan.*`)

        // ======== API To Anime ========
        let endpoint = `https://zelapioffciall.koyeb.app/imagecreator/toanime?url=${encodeURIComponent(imageUrl)}`
        let r = await fetch(endpoint)

        if (!r.ok) return m.reply(`*🍂 Gagal mengonversi gambar menjadi anime.*`)

        let animeBuffer = Buffer.from(await r.arrayBuffer())

        // ======== Kirim hasil anime ========
        await conn.sendMessage(
            m.chat,
            {
                image: animeBuffer,
                caption: `*🎨 Gambar berhasil diubah menjadi Anime ✨*`
            },
            { quoted: m }
        )

    } catch (e) {
        console.error(e)
        m.reply(`*🍂 Terjadi kesalahan saat memproses gambar.*`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['toanime']
handler.tags = ['maker']
handler.command = /^(toanime|animeconv|animeconvert)$/i
handler.limit = true

export default handler