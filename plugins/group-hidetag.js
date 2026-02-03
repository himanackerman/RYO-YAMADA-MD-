import { generateWAMessageFromContent } from '@adiwajshing/baileys'

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? m.quoted : m.msg
    if (!q.text) return m.reply(`Masukan text atau Reply pesan! \n\nContoh: \n${usedPrefix + command} Selamat Pagi`)
    
    let users = participants.map(u => conn.decodeJid(u.id))
    const msg = conn.cMod(
        m.chat, 
        generateWAMessageFromContent(m.chat, { 
            [c.toJSON ? q.mtype : 'extendedTextMessage']: c.toJSON ? c.toJSON() : { 
                text: c || '' 
            }
        }, { 
            quoted: m, 
            userJid: conn.user.id 
        }), 
        text || q.text, 
        conn.user.jid, 
        { mentions: users }
    )
    
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|ht)$/i

handler.group = true
handler.admin = true

export default handler