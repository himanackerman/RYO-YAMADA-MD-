const rewards = {
    exp: 50000,
    money: 49999,
    potion: 10,
    mythic: 3,
    legendary: 1
}

const cooldown = 2592000000 // 30 hari

let handler = async (m, { usedPrefix }) => {
    let user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {
        money: 0,
        exp: 0,
        potion: 0,
        mythic: 0,
        legendary: 0,
        lastmonthly: 0
    }

    if (new Date - user.lastmonthly < cooldown) {
        let remaining = clockString((user.lastmonthly + cooldown) - new Date())
        return m.reply(`ʏᴏᴜ'ᴠᴇ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ *ᴍᴏɴᴛʜʟʏ ʀᴇᴡᴀʀᴅs*, ᴩʟᴇᴀsᴇ ᴡᴀɪᴛ ᴛɪʟʟ ᴄᴏᴏʟᴅᴏᴡɴ ғɪɴɪsʜ.\n\n⏱️ ${remaining}`)
    }

    let text = ''
    for (let reward of Object.keys(rewards)) {
        user[reward] = (user[reward] || 0) + rewards[reward]
        text += `➠ ${global.rpg.emoticon(reward)} ${reward}: ${rewards[reward]}\n`
    }

    m.reply(`🔖 ᴍᴏɴᴛʜʟʏ ʀᴇᴡᴀʀᴅ ʀᴇᴄᴇɪᴠᴇᴅ:\n${text}`.trim())
    user.lastmonthly = new Date * 1
}

handler.help = ['monthly']
handler.tags = ['rpg']
handler.command = /^(monthly)$/i
handler.register = true
handler.group = true
handler.cooldown = cooldown
handler.rpg = true

export default handler

function clockString(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return `${d} hari ${h} jam ${m} menit ${s} detik`
}