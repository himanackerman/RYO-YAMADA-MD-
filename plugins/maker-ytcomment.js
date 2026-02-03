import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} username|komentar

Contoh:
${usedPrefix + command} Hilman|Halo hilman`)
    }

    let [username, komentar] = text.split('|')

    if (!username || !komentar) {
        return m.reply(`Format salah!
${usedPrefix + command} username|komentar`)
    }

    const avatar = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => `${global.APIs.deline}/Eu3BVf3K4x.jpg`)

    const url = `${global.APIs.deline}/maker/ytcomment?text=${encodeURIComponent(komentar.trim())}&username=${encodeURIComponent(username.trim())}&avatar=${encodeURIComponent(avatar)}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'ytcomment.jpg', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal membuat YouTube comment.')
    }
}

handler.help = ['ytcomment <username>|<komentar>']
handler.tags = ['maker']
handler.command = /^ytcomment$/i
handler.limit = true

export default handler