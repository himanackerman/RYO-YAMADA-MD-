let handler = async (m, { conn, args }) => {
    let who = m.mentionedJid?.[0]

    if (!who && args[1]) {
        let num = args[1].replace(/\D/g, '')
        if (num) who = num + '@s.whatsapp.net'
    }

    if (!who) {
        return m.reply(`
Contoh penggunaan:

.addrpg money @tag 10000
.addrpg exp @tag 5000
.addrpg limit @tag 50

⚔️ Equipment
.addrpg armor @tag 1
.addrpg sword @tag 1
.addrpg pickaxe @tag 1
.addrpg fishingrod @tag 1

🐾 Pet
.addrpg horse @tag 1
.addrpg horseexp @tag 100
.addrpg cat @tag 1
.addrpg catexp @tag 100
.addrpg fox @tag 1
.addrpg foxexp @tag 100
.addrpg dragon @tag 1
.addrpg dragonexp @tag 500

🍎 Item
.addrpg apel @tag 50
.addrpg mangga @tag 20
.addrpg jeruk @tag 20
.addrpg pisang @tag 20
.addrpg anggur @tag 20

🌱 Bibit
.addrpg bibitapel @tag 5
.addrpg bibitmangga @tag 5
.addrpg bibitjeruk @tag 5
.addrpg bibitpisang @tag 5
.addrpg bibitanggur @tag 5

💡 Semua field numerik yang ada di database user dapat ditambahkan menggunakan command ini.
`.trim())
    }

    let user = global.db.data.users[who]

    if (!user) {
        let alt = Object.keys(global.db.data.users).find(
            jid => jid.startsWith(who.split('@')[0])
        )

        if (alt) {
            who = alt
            user = global.db.data.users[alt]
        }
    }

    if (!user) return m.reply('User tidak ditemukan di database.')

    let type = (args[0] || '').toLowerCase()
    let amount = Number(args[2])

    if (!type) {
        return m.reply('Masukkan field yang ingin ditambahkan.')
    }

    if (isNaN(amount)) {
        return m.reply('Jumlah harus berupa angka.')
    }

    if (!(type in user)) {
        return m.reply(`Field *${type}* tidak ditemukan dalam database user.`)
    }

    if (typeof user[type] !== 'number') {
        return m.reply(`Field *${type}* bukan tipe angka.`)
    }

    user[type] += amount

    conn.reply(
        m.chat,
        `✅ Berhasil menambahkan *${amount.toLocaleString('id-ID')}* ke *${type}*

👤 @${who.split('@')[0]}
📦 ${type}: *${user[type].toLocaleString('id-ID')}*`,
        m,
        {
            mentions: [who]
        }
    )
}

handler.help = ['addrpg <field> @user <jumlah>']
handler.tags = ['owner', 'rpg']
handler.command = /^addrpg$/i
handler.rowner = true
handler.rpg = true

export default handler