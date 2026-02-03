import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text || !text.includes('|')) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} satpam|Jakarta`)
    }

    try {
        let [query, city] = text.split('|')

        const url = `${global.APIs.deline}/search/jobstreet?q=${encodeURIComponent(query.trim())}&city=${encodeURIComponent(city.trim())}`
        const { data } = await axios.get(url)

        if (!data.status || !data.result.length) {
            throw 'Lowongan tidak ditemukan'
        }

        const list = data.result.slice(0, 5)

        let caption = `💼 *Jobstreet Search*\n\n`

        for (let i = 0; i < list.length; i++) {
            let v = list[i]
            caption += `${i + 1}. *${v.judul}*\n`
            caption += `🏢 ${v.perusahaan}\n`
            caption += `📍 ${v.lokasi}\n`
            caption += `💰 ${v.gaji}\n`
            caption += `📅 ${v.tanggal}\n`
            caption += `🔗 ${v.link}\n\n`
        }

        const logo = list[0].logo

        if (logo) {
            const img = await axios.get(logo, { responseType: 'arraybuffer' })
            await conn.sendFile(m.chat, img.data, 'jobstreet.jpg', caption.trim(), m)
        } else {
            m.reply(caption.trim())
        }

    } catch (e) {
        console.error(e)
        m.reply('Gagal mencari lowongan Jobstreet.')
    }
}

handler.help = ['jobstreetsearch <posisi>|<kota>']
handler.tags = ['search']
handler.command = /^jobstreetsearch$/i
handler.limit = true

export default handler