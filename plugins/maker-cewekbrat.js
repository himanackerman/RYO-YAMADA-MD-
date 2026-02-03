import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} Halo hilman`)
    }

    const url = `${global.APIs.deline}/maker/cewekbrat?text=${encodeURIComponent(text)}`

    try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' })
        await conn.sendFile(m.chat, data, 'cewekbrat.jpg', '', m)
    } catch (e) {
        console.error(e)
        m.reply('Gagal membuat gambar cewek brat.')
    }
}

handler.help = ['cewekbrat <teks>']
handler.tags = ['maker']
handler.command = /^cewekbrat$/i
handler.limit = true

export default handler