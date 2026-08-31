import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await m.react('✨')

    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} jokowi`)
    }

    try {
        const url = `${global.APIs.deline}/stalker/ttstalk?username=${encodeURIComponent(text)}`
        const { data } = await axios.get(url)

        if (!data.status) throw 'User tidak ditemukan'

        const u = data.result.user
        const s = data.result.stats

        const img = await axios.get(u.avatarLarger, {
            responseType: 'arraybuffer'
        })

        const caption = `🎵 *TikTok Stalk*

👤 Username : ${u.uniqueId}
📛 Nickname : ${u.nickname}
📝 Bio : ${u.signature || '-'}
🌍 Region : ${u.region || '-'}
✔️ Verified : ${u.verified ? 'Ya' : 'Tidak'}
🔒 Private : ${u.privateAccount ? 'Ya' : 'Tidak'}

👥 Followers : ${s.followerCount.toLocaleString()}
➡️ Following : ${s.followingCount.toLocaleString()}
❤️ Likes : ${s.heartCount.toLocaleString()}
🎬 Video : ${s.videoCount.toLocaleString()}`

        await conn.sendFile(m.chat, img.data, 'ttstalk.jpg', caption, m)

    } catch (e) {
        console.error(e)
        m.reply('Gagal melakukan TikTok Stalk.')
    }
}

handler.help = ['ttstalk <username>']
handler.tags = ['stalk']
handler.command = /^ttstalk$/i
handler.limit = true

export default handler