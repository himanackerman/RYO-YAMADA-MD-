import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} jokowi`)
    }

    try {
        const url = `${global.APIs.deline}/stalker/igstalk?username=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status) throw 'User tidak ditemukan'

        const u = data.result

        const img = await axios.get(u.profile_pic, {
            responseType: 'arraybuffer'
        })

        const caption = `📸 *Instagram Stalk*

👤 Username : ${u.username}
📛 Fullname : ${u.fullname}
📝 Bio : ${u.biography || '-'}
🏷️ Kategori : ${u.category || '-'}
👥 Followers : ${u.followers.toLocaleString()}
➡️ Following : ${u.following.toLocaleString()}
🖼️ Posts : ${u.posts.toLocaleString()}
🔒 Private : ${u.is_private ? 'Ya' : 'Tidak'}
✔️ Verified : ${u.is_verified ? 'Ya' : 'Tidak'}`

        await conn.sendFile(m.chat, img.data, 'igstalk.jpg', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal melakukan IG Stalk.')
    }
}

handler.help = ['igstalk <username>']
handler.tags = ['stalker']
handler.command = /^igstalk$/i
handler.limit = true

export default handler