// nih buat kmren yang nanyain fitur sewa bot auto out
// klo ga work sesuaiin aja sama sc nya

let handler = async (m, { conn, args, usedPrefix, command, isROwner }) => {
    const cmd = command.toLowerCase()

    if (cmd === 'ceksewa') {
        if (!m.isGroup && !args[0]) throw `Perintah ini hanya bisa digunakan di dalam grup!`
        let who = args[0] ? await resolveTarget(conn, args[0]) : m.chat
        let chat = global.db.data.chats[who]
        if (!chat || !chat.expired) throw `Group Ini Tidak DiSet Sewa !`
        let sisa = chat.expired - Date.now()
        conn.reply(m.chat, `*sᴇᴡᴀ*\n${msToDate(sisa)}`, m)
        return
    }

    if (cmd === 'delsewa') {
        if (!isROwner) throw `Perintah ini khusus owner!`
        if (!m.isGroup && !args[0]) throw `Perintah ini hanya bisa digunakan di dalam grup!`
        let who = args[0] ? await resolveTarget(conn, args[0]) : m.chat
        if (!global.db.data.chats[who]) global.db.data.chats[who] = {}
        global.db.data.chats[who].expired = false
        conn.reply(m.chat, `Berhasil menghapus sewa untuk Grup ini`, m)
        return
    }

    if (cmd === 'setsewa') {
        if (!isROwner) throw `Perintah ini khusus owner!`
        if (!args[0]) throw `*Error:* Masukkan durasi!\n\n*Contoh:*\n${usedPrefix + command} 30d\n${usedPrefix + command} 5jam\n${usedPrefix + command} 15m\n${usedPrefix + command} 30d 120363xxxx@g.us\n${usedPrefix + command} 30d https://chat.whatsapp.com/xxxx`

        let input = args[0].toLowerCase()
        let target = args[1] ? await resolveTarget(conn, args[1]) : m.chat

        let match = input.match(/^(\d+)(hari|h|d|jam|j|menit|m)?$/i)
        if (!match) throw `*Error:* Format salah!\n\nGunakan:\n30d / 30hari (hari)\n5jam / 5j / 5h (jam)\n15m / 15menit (menit)`

        let angka = parseInt(match[1])
        let satuan = (match[2] || 'd').toLowerCase()

        let durasi = 0
        if (satuan === 'd' || satuan === 'hari') durasi = angka * 86400000
        else if (satuan === 'h' || satuan === 'j' || satuan === 'jam') durasi = angka * 3600000
        else if (satuan === 'm' || satuan === 'menit') durasi = angka * 60000

        if (!global.db.data.chats[target]) global.db.data.chats[target] = {}

        let now = Date.now()
        global.db.data.chats[target].expired = now + durasi
        let sisa = global.db.data.chats[target].expired - now

        conn.reply(m.chat, `Berhasil set sewa\nTarget: ${target}\nDurasi: ${args[0]}\nSisa: ${msToDate(sisa)}`, m)
        return
    }

    if (cmd === 'listsewa') {
        if (!isROwner) throw `Perintah ini khusus owner!`
        let chats = global.db.data.chats
        let list = []
        for (let id of Object.keys(chats)) {
            let chat = chats[id]
            if (!chat || !chat.expired) continue
            let sisa = chat.expired - Date.now()
            let nama = conn.chats[id]?.name || conn.getName ? conn.getName(id) : id
            list.push(`• ${nama}\n  ${id}\n  Sisa: ${msToDate(sisa)}`)
        }
        if (!list.length) throw `Tidak ada grup yang sedang disewa!`
        conn.reply(m.chat, `*ʟɪsᴛ sᴇᴡᴀ*\n\n${list.join('\n\n')}`, m)
        return
    }
}

handler.help = ['ceksewa', 'delsewa', 'listsewa', 'setsewa <durasi> [idgc/link]']
handler.tags = ['owner']
handler.command = /^(setsewa|listsewa|ceksewa|delsewa)$/i

export default handler

export async function all(m) {
    if (!m.isGroup) return true

    let chats = global.db.data.chats[m.chat]
    if (!chats || !chats.expired) return true

    let expired = Number(chats.expired)
    if (isNaN(expired)) {
        chats.expired = null
        return true
    }

    if (Date.now() > expired) {
        await this.reply(m.chat, 'Bye🖐 bot akan left, terimakasih sudah sewa')
        await this.groupLeave(m.chat)
        chats.expired = null
    }

    return true
}

setInterval(async () => {
    if (!global.conn || !global.conn.user) return
    if (!global.db?.data?.chats) return

    let chats = global.db.data.chats
    for (let id of Object.keys(chats)) {
        let chat = chats[id]
        if (!chat || !chat.expired) continue

        let expired = Number(chat.expired)
        if (isNaN(expired)) {
            chat.expired = null
            continue
        }

        if (Date.now() > expired) {
            try {
                await global.conn.sendMessage(id, { text: 'Bye🖐 bot akan left, terimakasih sudah sewa' })
                await global.conn.groupLeave(id)
            } catch (e) {}
            chat.expired = null
        }
    }
}, 60000)

async function resolveTarget(conn, target) {
    if (/chat\.whatsapp\.com\//i.test(target)) {
        let code = target.split('chat.whatsapp.com/')[1].split(/[?/\s]/)[0]
        try {
            let info = await conn.groupGetInviteInfo(code)
            return info.id
        } catch (e) {
            throw `Link grup tidak valid atau sudah kadaluarsa!`
        }
    }
    return target
}

function msToDate(ms) {
    let days = Math.floor(ms / 86400000)
    let daysms = ms % 86400000
    let hours = Math.floor(daysms / 3600000)
    let hoursms = ms % 3600000
    let minutes = Math.floor(hoursms / 60000)
    return `${days} hari ${hours} jam ${minutes} menit`
}