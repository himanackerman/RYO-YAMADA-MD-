let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
    if (!isAdmin) return m.reply('Hanya admin yang bisa pakai!')
    let chat = global.db.data.chats[m.chat]
    
    chat.antiSpam = args[0] === 'on'
    m.reply(`✅ Anti-Spam berhasil di${chat.antiSpam ? 'aktifkan' : 'matikan'}`)
}

handler.before = async function (m, { conn }) {
    if (m.fromMe || m.isBaileys || !m.isGroup) return 
    let chat = global.db.data.chats[m.chat]
    if (!chat?.antiSpam) return 

    this.spam = this.spam ? this.spam : {}
    let user = this.spam[m.sender] || { last: 0, count: 0, warned: false }
    let now = Date.now()
    let diff = now - user.last

    if (diff < 2000) {
        user.count++
        if (user.count >= 3) {
            if (!user.warned) {
                user.warned = true
                await conn.reply(m.chat, `⚠️ @${m.sender.split('@')[0]} Jangan spam! Jeda 2 detik.`, m, { mentions: [m.sender] })
                setTimeout(() => { if (this.spam[m.sender]) this.spam[m.sender].warned = false }, 5000)
            }
            return true // Ini akan menghentikan handler.js memproses perintah
        }
    } else {
        user.count = 0
    }

    user.last = now
    this.spam[m.sender] = user
}

handler.help = ['antispam <on/off>']
handler.tags = ['group']
handler.command = ['antispam']
handler.group = true

export default handler