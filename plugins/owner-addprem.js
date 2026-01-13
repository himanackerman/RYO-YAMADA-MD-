let handler = async (m, { conn, text }) => {
    if (!text) throw `⚠️ Masukkan format:\n.addprem nomor waktu\n\nContoh:\n.addprem 62xxxx 7d`

    let [number, time] = text.split(' ')
    if (!number) throw '⚠️ Nomor tidak boleh kosong!'
    if (!time) throw '⚠️ Waktu tidak boleh kosong!'

    // Convert nomor biar sesuai JID WA
    number = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    // Kalau user belum ada di DB, buat baru
    if (!global.db.data.users[number]) {
        global.db.data.users[number] = {
            role: 'Free user',
            premium: false,
            premiumTime: 0,
            limit: 50, // default
            exp: 0,
        }
    }

    let user = global.db.data.users[number]

    // Parsing waktu (d/h/m/s)
    let duration = ms(time)
    if (duration === undefined) throw '⚠️ Format waktu salah!\nGunakan: 1d = 1 hari, 7d = 7 hari, 12h = 12 jam'

    user.role = 'Premium user'
    user.premium = true
    user.premiumTime = Date.now() + duration

    await conn.reply(m.chat, 
        `✅ Sukses menambahkan premium!\n\n👤 User: @${number.split('@')[0]}\n⏳ Durasi: ${time}`, 
        m, 
        { mentions: [number] }
    )
}

handler.help = ['addprem nomor waktu']
handler.tags = ['owner']
handler.command = /^addprem$/i
handler.rowner = true

export default handler

// Fungsi convert waktu
function ms(str) {
    if (typeof str !== 'string') return undefined
    let match = str.match(/^(\d+)(d|h|m|s)$/)
    if (!match) return undefined
    let val = parseInt(match[1])
    let type = match[2]
    switch (type) {
        case 'd': return val * 24 * 60 * 60 * 1000
        case 'h': return val * 60 * 60 * 1000
        case 'm': return val * 60 * 1000
        case 's': return val * 1000
    }
}