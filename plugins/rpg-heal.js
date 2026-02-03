let handler = async (m, { conn, args }) => {
    let user = global.db.data.users[m.sender]

    if (!user.health) user.health = 0
    if (!user.potion) user.potion = 0
    if (!user.cat) user.cat = 0

    let img = global.fla.getRandom() + encodeURIComponent('HEALTH FULL')

    if (user.health >= 100) {
        return conn.sendFile(
            m.chat,
            img,
            'heal.jpg',
            '❤️ Health kamu sudah penuh!',
            m
        )
    }

    const heal = 40 + (user.cat * 4)

    let need = Math.ceil((100 - user.health) / heal)
    let count = args[0] ? parseInt(args[0]) : need
    if (isNaN(count) || count < 1) count = 1

    if (user.potion < count)
        return m.reply(`Potion kamu kurang.`)

    user.potion -= count
    user.health += heal * count
    if (user.health > 100) user.health = 100

    let img2 = global.fla.getRandom() + encodeURIComponent('HEAL SUCCESS')

    conn.sendFile(
        m.chat,
        img2,
        'heal.jpg',
        `Berhasil memakai ${count} 🧪 potion\n❤️ Health: ${user.health}/100`,
        m
    )
}

handler.help = ['heal']
handler.tags = ['rpg']
handler.command = /^(heal)$/i
handler.register = true
handler.rpg = true

export default handler