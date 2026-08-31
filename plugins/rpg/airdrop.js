let handler = async (m, { conn }) => {
    const user = global.db.data.users[m.sender]
    const em = global.rpg.emoticon
    const timeout = 3600000

    let time = user.lastclaim + timeout

    if (Date.now() - user.lastclaim < timeout) {
        throw `🎁 Kamu sudah mencari Airdrop!\n\nTunggu ${clockString(time - Date.now())}`
    }

    let bot = Math.floor(Math.random() * 101)
    let player = Math.floor(Math.random() * 81)

    if (bot > player) {
        let trash = Math.floor(Math.random() * 50) + 1
        let wood = Math.floor(Math.random() * 50) + 1
        let rock = Math.floor(Math.random() * 50) + 1

        user.trash += trash
        user.wood += wood
        user.rock += rock

        await conn.sendFile(
            m.chat,
            'https://telegra.ph/file/60437ce6d807b605adf5e.jpg',
            'airdrop.jpg',
            `
📦 *Airdrop Biasa*

Kamu menemukan peti tua.

🎁 Hadiah:

${em('trash')} Trash: +${trash}
${em('wood')} Wood: +${wood}
${em('rock')} Rock: +${rock}
`.trim(),
            m
        )

    } else if (bot < player) {
        let limit = pickRandom([10, 20, 30])
        let money = pickRandom([10000, 100000, 500000])
        let diamond = pickRandom([1, 2, 3, 5])

        user.limit += limit
        user.money += money
        user.diamond += diamond

        await conn.sendFile(
            m.chat,
            'https://telegra.ph/file/d3bc1d7a97c62d3baaf73.jpg',
            'airdrop.jpg',
            `
🎁 *Airdrop Rare*

Selamat! Kamu mendapatkan hadiah langka.

${em('limit')} Limit: +${limit}
${em('money')} Money: +${money}
${em('diamond')} Diamond: +${diamond}
`.trim(),
            m
        )

    } else {
        let loss = Math.min(user.money, 100000)

        user.money -= loss

        await conn.sendFile(
            m.chat,
            'https://telegra.ph/file/5d71027ecbcf771b299fb.jpg',
            'zonk.jpg',
            `
💨 *Airdrop Zonk*

Kotaknya kosong...

${em('money')} Money: -${loss}
🎐 Isi: Angin
`.trim(),
            m
        )
    }

    user.lastclaim = Date.now()
}

handler.help = ['airdrop']
handler.tags = ['rpg']
handler.command = /^airdrop$/i
handler.group = true
handler.rpg = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let d = Math.floor(ms / 86400000)
    let h = Math.floor(ms / 3600000) % 24
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`
}