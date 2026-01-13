let handler = async (m, { conn, text }) => {
    if (!text) throw `⚠️ Masukkan nomor!\n\nContoh:\n.delprem 62xxxx`

    let number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    // Cek kalau user belum ada di DB, auto buat biar gak error
    if (!global.db.data.users[number]) {
        global.db.data.users[number] = {
            role: 'Free user',
            premium: false,
            premiumTime: 0,
            limit: 50,
            exp: 0,
        }
    }

    let user = global.db.data.users[number]

    // Reset ke user biasa
    user.role = 'Free user'
    user.premium = false
    user.premiumTime = 0

    await conn.reply(
        m.chat,
        `❌ Premium dihapus!\n\n👤 User: @${number.split('@')[0]}`,
        m,
        { mentions: [number] }
    )
}

handler.help = ['delprem nomor']
handler.tags = ['owner']
handler.command = /^delprem$/i
handler.rowner = true

export default handler