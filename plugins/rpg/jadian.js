const kataTembak = [
`Hai.

Aku mau jujur tentang sesuatu.

Selama ini aku merasa nyaman saat ngobrol dan menghabiskan waktu denganmu.

Aku punya perasaan lebih dari sekadar teman.

Jadi...

Maukah kamu menjadi pasanganku? ❤️`,

`Aku tidak pandai merangkai kata.

Tapi aku ingin mengatakan apa yang sebenarnya aku rasakan.

Semakin lama mengenalmu, semakin aku sadar kalau kamu adalah orang yang spesial bagiku.

Karena itu aku memberanikan diri untuk bertanya.

Maukah kamu menjadi pasanganku? 💖`,

`Awalnya aku menganggap kita hanya teman biasa.

Namun waktu membuat perasaanku berubah.

Kamu selalu berhasil membuat hariku terasa lebih baik.

Hari ini aku ingin jujur.

Aku menyukaimu.

Maukah kamu menjadi pasanganku? 🌹`,

`Di setiap waktu yang kita lalui bersama, aku selalu menemukan alasan baru untuk mengagumimu.

Bukan karena kamu sempurna.

Tapi karena kamu adalah dirimu sendiri.

Aku tidak ingin terus menyimpan perasaan ini sendirian.

Maukah kamu menjadi pasanganku? ❤️`,

`Mungkin ini terdengar tiba-tiba.

Tapi aku sudah cukup lama menyimpan perasaan ini.

Aku suka caramu berbicara.
Aku suka caramu bersikap.
Dan aku suka kehadiranmu.

Jadi hari ini aku memilih untuk jujur.

Maukah kamu menjadi pasanganku? 💕`
]

if (!global.db.data.tembak) global.db.data.tembak = {}

let handler = async (m, { conn, command }) => {
    let user = global.db.data.users[m.sender]

    if (command === 'tembak') {
        let who = m.mentionedJid?.[0] || m.quoted?.sender

        if (!who) return m.reply('Tag orang yang mau ditembak')
        if (who === m.sender) return m.reply('Ga bisa nembak diri sendiri ')

        let target = global.db.data.users[who]
        if (!target) return m.reply('Target tidak ditemukan')

        if (user.jadian) return m.reply('Kamu sudah punya pasangan 💔')
        if (target.jadian) return m.reply('Dia sudah punya pasangan 💔')

        global.db.data.tembak[who] = {
            from: m.sender,
            time: Date.now()
        }

        let surat = kataTembak[Math.floor(Math.random() * kataTembak.length)]

        return conn.reply(
            m.chat,
            `💌 @${m.sender.split('@')[0]} menyatakan perasaannya kepada @${who.split('@')[0]}

${surat}

─────────────────

Ketik *.terima* untuk menerima
Ketik *.tolak* untuk menolak`,
            m,
            { mentions: [m.sender, who] }
        )
    }

    if (command === 'terima') {
        let req = global.db.data.tembak[m.sender]

        if (!req) return m.reply('Tidak ada yang menembak kamu')

        let sender = global.db.data.users[req.from]

        if (!sender) {
            delete global.db.data.tembak[m.sender]
            return m.reply('Data pengirim tidak ditemukan')
        }

        if (sender.jadian) {
            delete global.db.data.tembak[m.sender]
            return m.reply('Dia sudah memiliki pasangan')
        }

        user.jadian = true
        user.pasangan = req.from
        user.pacar = req.from
        user.jadianTime = Date.now()

        sender.jadian = true
        sender.pasangan = m.sender
        sender.pacar = m.sender
        sender.jadianTime = Date.now()

        delete global.db.data.tembak[m.sender]

        return conn.reply(
            m.chat,
            `🎉 Selamat!

❤️ @${req.from.split('@')[0]}
❤️ @${m.sender.split('@')[0]}

Kalian sekarang resmi berpacaran 💍`,
            m,
            { mentions: [req.from, m.sender] }
        )
    }

    if (command === 'tolak') {
        let req = global.db.data.tembak[m.sender]

        if (!req) return m.reply('Tidak ada yang menembak kamu')

        delete global.db.data.tembak[m.sender]

        return conn.reply(
            m.chat,
            `💔 @${req.from.split('@')[0]} ditolak`,
            m,
            { mentions: [req.from] }
        )
    }

    if (command === 'putus') {
        if (!user.jadian || !user.pasangan) {
            return m.reply('Kamu sedang tidak memiliki pasangan')
        }

        let pasangan = user.pasangan
        let target = global.db.data.users[pasangan]

        user.jadian = false
        user.pasangan = ''
        user.pacar = ''
        user.jadianTime = 0

        if (target) {
            target.jadian = false
            target.pasangan = ''
            target.pacar = ''
            target.jadianTime = 0
        }

        return conn.reply(
            m.chat,
            `💔 Hubungan @${m.sender.split('@')[0]} dan @${pasangan.split('@')[0]} telah berakhir.`,
            m,
            { mentions: [m.sender, pasangan] }
        )
    }

    if (command === 'pasangan') {
        if (!user.jadian || !user.pasangan) {
            return m.reply('Kamu belum memiliki pasangan')
        }

        let waktu = Date.now() - user.jadianTime

        let hari = Math.floor(waktu / 86400000)
        let jam = Math.floor(waktu / 3600000) % 24
        let menit = Math.floor(waktu / 60000) % 60

        return conn.reply(
            m.chat,
            `💖 *STATUS HUBUNGAN*

👤 Pasangan:
@${user.pasangan.split('@')[0]}

📅 Lama Jadian:
${hari} Hari ${jam} Jam ${menit} Menit`,
            m,
            { mentions: [user.pasangan] }
        )
    }
}

handler.help = ['tembak @tag', 'terima', 'tolak', 'putus', 'pasangan']
handler.tags = ['rpg']
handler.command = /^(tembak|terima|tolak|putus|pasangan)$/i
handler.group = true
handler.register = true

export default handler