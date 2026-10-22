let handler = async (m, { conn, participants }) => {
    let targetUser = m.mentionedJid[0] || participants[Math.floor(Math.random() * participants.length)].id
    let targetName = conn.getName(targetUser)

    let user = global.db.data.users[m.sender]
    let __timers = (new Date() - user.lastmisi)
    let _timers = (1200000 - __timers)
    let timers = clockString(_timers)

    let name = conn.getName(m.sender)
    let id = m.sender
    let kerja = 'ewe-paksa'

    conn.misi = conn.misi ? conn.misi : {}

    if (id in conn.misi) {
        return m.reply(`Selesaikan Misi ${conn.misi[id][0]} Terlebih Dahulu, jangan buru-buru... 😋`)
    }

    if (new Date() - user.lastmisi > 1200000) {
        let randomMoney = Math.floor(Math.random() * 1000000)
        let randomExp = Math.floor(Math.random() * 10000)

        let teks1 = `👙 ${name} mulai maksa buka baju ${targetName} di pojokan... 😋`.trim()
        let teks2 = `🥵💦 ${targetName} cuma bisa pasrah... 'Ahhhh... pelan-pelan mas...'`.trim()
        let teks3 = `🥵 Ahhhh, Sakitttt!! >////<\n💦 Crotttt..... masuk dalem banget!\n💦 Crottt lagi sampe luber...`.trim()
        let teks4 = `🥵💦💦 Ahhhhhh... ${targetName} lemes total mandi cairan kamu...😫`.trim()

        let hsl = `
*—[ HASIL EWE PAKSA ]—*
➕ 💹 Money : [ ${randomMoney} ]
➕ ✨ Exp : [ ${randomExp} ]
➕ 😍 Total Ewe : [ ${user.ojek + 1} ]

Bener-bener jagoan kamu bikin ${targetName} nggak berdaya... 
`.trim()

        user.money += randomMoney
        user.exp += randomExp
        user.ojek += 1

        conn.misi[id] = [
            kerja,
            setTimeout(() => {
                delete conn.misi[id]
            }, 27000)
        ]

        const arr = [
            { text: teks1, timeout: 5000 },
            { text: teks2, timeout: 4000 },
            { text: teks3, timeout: 3000 },
            { text: teks4, timeout: 3000 },
            { text: hsl, timeout: 3000 },
        ]

        const lll = await conn.sendMessage(m.chat, { text: '😋 Mulai ewe paksa... target sudah terkunci!' }, { quoted: m })

        for (let i = 0; i < arr.length; i++) {
            await new Promise(resolve => setTimeout(resolve, arr[i].timeout))
            await conn.relayMessage(m.chat, {
                protocolMessage: {
                    key: lll.key,
                    type: 14,
                    editedMessage: {
                        conversation: arr[i].text
                    }
                }
            }, {})
        }

        user.lastmisi = new Date() * 1
    } else {
        m.reply(`Tunggu ${timers} lagi ya Sayang... kumpulin tenaga biar nanti genjotannya makin mantap! 💋`)
    }
}

handler.help = ['ewepapksa @tag']
handler.tags = ['rpg']
handler.command = /^(ewepaksa|perkosa)$/i
handler.register = true
handler.group = true
handler.premium = true

export default handler

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}