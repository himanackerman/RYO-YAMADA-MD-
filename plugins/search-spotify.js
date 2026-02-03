import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} swim chase atlantic`)
    }

    try {
        const url = `${global.APIs.deline}/search/spotify?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.data.length) {
            throw 'Lagu tidak ditemukan'
        }

        const list = data.data.slice(0, 5)

        let caption = `🎵 *Spotify Search*\n\n`
        for (let i = 0; i < list.length; i++) {
            let v = list[i]
            caption += `${i + 1}. *${v.title}*\n`
            caption += `👤 ${v.artis}\n`
            caption += `⏱️ ${v.durasi}\n`
            caption += `🔗 ${v.url}\n\n`
        }

        const img = await axios.get(list[0].image, {
            responseType: 'arraybuffer'
        })

        await conn.sendFile(m.chat, img.data, 'spotify.jpg', caption.trim(), m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari lagu Spotify.')
    }
}

handler.help = ['spotifysearch <judul lagu>']
handler.tags = ['search']
handler.command = /^spotifysearch$/i
handler.limit = true

export default handler