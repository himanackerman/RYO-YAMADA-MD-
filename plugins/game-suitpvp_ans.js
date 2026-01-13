let handler = m => m

handler.before = async function (m) {
    if (!this.suit) this.suit = {}

    let user = global.db.data.users
    if (!user[m.sender]) user[m.sender] = { exp: 0, suit: 0 }

    if (user[m.sender].suit < 0) user[m.sender].suit = 0

    let room = Object.values(this.suit).find(room => room.id && room.status && [room.p, room.p2].includes(m.sender))
    if (room) {
        let win = ''
        let tie = false

        if (m.sender == room.p2 && /^(acc(ept)?|terima|gas|oke?|tolak|gamau|nanti|ga(k.)?bisa)/i.test(m.text) && m.isGroup && room.status == 'wait') {
            if (/^(tolak|gamau|nanti|ga(k.)?bisa)/i.test(m.text)) {
                this.reply(m.chat, `@${room.p2.split`@`[0]} menolak suit, suit dibatalkan`, m, { contextInfo: { mentionedJid: [room.p2] } })
                delete this.suit[room.id]
                return !0
            }
            room.status = 'play'
            room.asal = m.chat
            clearTimeout(room.waktu)

            this.reply(m.chat, `Suit telah dikirim ke:
@${room.p.split`@`[0]} dan @${room.p2.split`@`[0]}

Silakan pilih suit di chat pribadi masing-masing.
Klik wa.me/${conn.user.jid.split`@`[0]}`, m, { mentions: [room.p, room.p2] })

            if (room.status == 'play') {
                await this.reply(room.p, `Silakan pilih *batu/gunting/kertas*\n\nMenang +${room.poin}XP\nKalah -${room.poin_lose}XP`, null)
                await delay(1500)
                await this.reply(room.p2, `Silakan pilih *batu/gunting/kertas*\n\nMenang +${room.poin}XP\nKalah -${room.poin_lose}XP`, null)
            }

            room.waktu_milih = setTimeout(() => {
                if (!room.pilih && !room.pilih2) {
                    this.reply(m.chat, `Kedua pemain tidak memilih.\nSuit dibatalkan.`, m)
                } else if (!room.pilih || !room.pilih2) {
                    win = !room.pilih ? room.p2 : room.p
                    this.reply(m.chat, `@${(!room.pilih ? room.p : room.p2).split`@`[0]} tidak memilih, game berakhir.`, m, {
                        mentions: [!room.pilih ? room.p : room.p2]
                    })
                    user[win].exp += room.poin
                    user[win == room.p ? room.p2 : room.p].exp -= room.poin_lose
                }
                delete this.suit[room.id]
                return !0
            }, room.timeout)
        }

        let jwb = m.sender == room.p
        let jwb2 = m.sender == room.p2
        let g = /gunting/i
        let b = /batu/i
        let k = /kertas/i
        let reg = /^(gunting|batu|kertas)/i

        if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
            room.pilih = reg.exec(m.text.toLowerCase())[0]
            room.text = m.text
            m.reply(`Kamu memilih ${m.text}${!room.pilih2 ? '\n\nMenunggu lawan memilih' : ''}`)
            if (!room.pilih2) this.reply(room.p2, '_Lawan sudah memilih_\nSekarang giliran kamu', null)
        }

        if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
            room.pilih2 = reg.exec(m.text.toLowerCase())[0]
            room.text2 = m.text
            m.reply(`Kamu memilih ${m.text}${!room.pilih ? '\n\nMenunggu lawan memilih' : ''}`)
            if (!room.pilih) this.reply(room.p, '_Lawan sudah memilih_\nSekarang giliran kamu', null)
        }

        if (room.pilih && room.pilih2) {
            clearTimeout(room.waktu_milih)
            let stage = room.pilih
            let stage2 = room.pilih2

            if (b.test(stage) && g.test(stage2)) win = room.p
            else if (b.test(stage) && k.test(stage2)) win = room.p2
            else if (g.test(stage) && k.test(stage2)) win = room.p
            else if (g.test(stage) && b.test(stage2)) win = room.p2
            else if (k.test(stage) && b.test(stage2)) win = room.p
            else if (k.test(stage) && g.test(stage2)) win = room.p2
            else if (stage == stage2) tie = true

            this.reply(room.asal, `
_*Hasil Suit*_${tie ? '\nSERI' : ''}

@${room.p.split`@`[0]} (${room.text}) ${tie ? '' : room.p == win ? `Menang +${room.poin}XP` : `Kalah -${room.poin_lose}XP`}
@${room.p2.split`@`[0]} (${room.text2}) ${tie ? '' : room.p2 == win ? `Menang +${room.poin}XP` : `Kalah -${room.poin_lose}XP`}
`.trim(), null, { mentions: [room.p, room.p2] })

            if (!tie) {
                user[win].exp += room.poin
                user[win == room.p ? room.p2 : room.p].exp -= room.poin_lose
            }
            delete this.suit[room.id]
        }
    }
    return !0
}

handler.exp = 0
export default handler

let delay = time => new Promise(res => setTimeout(res, time))