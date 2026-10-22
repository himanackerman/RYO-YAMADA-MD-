let handler = async (m, { conn }) => {
    let who = m.mentionedJid?.[0]

    if (!m.isGroup) return m.reply('Command ini hanya untuk grup.')
    if (!who) return m.reply('Tag target yang ingin dirampok.')
    if (who === m.sender) return m.reply('Tidak bisa merampok diri sendiri.')

    let users = global.db.data.users
    let user = users[m.sender]
    let target = users[who]

    if (!target) return m.reply('Target tidak ditemukan di database.')

    let cooldown = 3600000
    let timers = cooldown - (Date.now() - user.lastrampok)

    if (Date.now() - user.lastrampok < cooldown) {
        return m.reply(
            `🦹 Kamu masih bersembunyi.\n\nTunggu ${clockString(timers)} lagi.`
        )
    }

    if (target.money < 10000) {
        return m.reply(
            '💸 Target terlalu miskin untuk dirampok.'
        )
    }

    let dapat = Math.floor(Math.random() * 50000) + 1000

    if (dapat > target.money) {
        dapat = target.money
    }

    target.money -= dapat
    user.money += dapat
    user.lastrampok = Date.now()

    conn.reply(
        m.chat,
        `
🦹 *BERHASIL MERAMPOK*

👤 Target : @${who.split('@')[0]}
💰 Hasil : ${dapat.toLocaleString('id-ID')} Money

🏃 Cepat kabur sebelum ketahuan!
        `.trim(),
        m,
        { mentions: [who] }
    )
}

handler.help = ['merampok @tag']
handler.tags = ['rpg']
handler.command = /^merampok$/i
handler.group = true
handler.register = true
handler.rpg = true

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}