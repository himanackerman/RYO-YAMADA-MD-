import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} cinta untuk starla`)
    }

    try {
        const url = `${global.APIs.deline}/search/applemusic?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.length) {
            throw 'Lagu tidak ditemukan'
        }

        const list = data.result.slice(0, 5)

        let caption = `🍎 *Apple Music Search*\n\n`

        for (let i = 0; i < list.length; i++) {
            let v = list[i]
            caption += `${i + 1}. *${v.title}*\n`
            caption += `👤 ${v.artist.name}\n`
            caption += `🎵 ${v.song}\n`
            caption += `🔗 ${v.artist.url}\n\n`
        }

        m.reply(caption.trim())

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari di Apple Music.')
    }
}

handler.help = ['applemusicsearch <judul lagu>']
handler.tags = ['search']
handler.command = /^applemusicsearch$/i
handler.limit = true

export default handler