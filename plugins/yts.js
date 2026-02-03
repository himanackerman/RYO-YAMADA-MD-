import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} swim chase atlantic`)
    }

    try {
        const url = `${global.APIs.deline}/search/youtube?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.length) {
            throw 'Video tidak ditemukan'
        }

        const list = data.result.slice(0, 5)

        let caption = `📺 *YouTube Search*\n\n`

        for (let i = 0; i < list.length; i++) {
            let v = list[i]
            caption += `${i + 1}. *${v.title}*\n`
            caption += `📡 ${v.channel}\n`
            caption += `⏱️ ${v.duration}\n`
            caption += `🔗 ${v.link}\n\n`
        }

        const thumb = await axios.get(list[0].imageUrl, {
            responseType: 'arraybuffer'
        })

        await conn.sendFile(m.chat, thumb.data, 'youtube.jpg', caption.trim(), m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari video YouTube.')
    }
}

handler.help = ['youtubesearch <query>', 'yts <query>']
handler.tags = ['search']
handler.command = /^(youtubesearch|yts)$/i
handler.limit = true

export default handler