let handler = {}

handler.before = async function (m, { conn }) {
    if (!m.isGroup) return
    if (m.fromMe) return

    const ownerNumber = '6285523568687@s.whatsapp.net'
    if (m.sender !== ownerNumber) return

    let user = global.db.data.users[m.sender] || {}
    let now = +new Date()

    if (user.ownerWelcome && now - user.ownerWelcome < 3600000) return

    user.ownerWelcome = now
    global.db.data.users[m.sender] = user

    await conn.sendMessage(m.chat, {
        text: `Hai ownerku. Ryo di sini.\n@${ownerNumber.split('@')[0]}`,
        mentions: [ownerNumber]
    })
}

export default handler