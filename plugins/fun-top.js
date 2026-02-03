let handler = async (m, { conn, groupMetadata, usedPrefix, command, text }) => {
    if (!text) throw `Contoh:\n${usedPrefix + command} 5 ngeselin`

    let args = text.trim().split(' ')
    let total = parseInt(args[0])
    let alasan = isNaN(total) ? text : args.slice(1).join(' ')

    if (!alasan) throw `Contoh:\n${usedPrefix + command} 5 ngeselin`

    if (isNaN(total)) total = 10

    let participants = groupMetadata.participants
    if (participants.length < total) return m.reply(`Anggota grup kurang dari ${total} 😅`)

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            ;[array[i], array[j]] = [array[j], array[i]]
        }
        return array
    }

    let shuffled = shuffle([...participants])
    let pick = shuffled.slice(0, total)

    let emoji = pickRandom(['😨','😅','😂','😳','😎','🥵','😱','🐦','🙄','🐤','🗿','🤨','🥴','😐','👆','😔','👀','👎'])

    let teks = `*${emoji} Top ${total} ${alasan} ${emoji}*\n\n`

    for (let i = 0; i < pick.length; i++) {
        teks += `*${i + 1}. @${pick[i].id.split('@')[0]}*\n`
    }

    conn.sendMessage(m.chat, {
        text: teks.trim(),
        mentions: pick.map(p => p.id)
    }, { quoted: m })
}

handler.help = ['top [jumlah] [teks]']
handler.tags = ['fun']
handler.command = /^top$/i
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}