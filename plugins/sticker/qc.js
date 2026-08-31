import { sticker } from '../../lib/sticker.js'
import axios from 'axios'

function normalizeJid(jid = '') {
    if (!jid) return jid
    if (jid.endsWith('@lid')) return jid.replace('@lid', '@s.whatsapp.net')
    return jid
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let text = ''
    let color = 'white'

    const colorMap = {
        putih: 'white',
        hitam: 'black',
        merah: 'red',
        biru: 'blue',
        hijau: 'green',
        kuning: 'yellow',
        ungu: 'purple',
        pink: 'pink',
        orange: 'orange',
        coklat: 'brown',
        abu: 'gray',
        cyan: 'cyan'
    }

    const listWarna = Object.keys(colorMap).map(v => `• ${v}`).join('\n')

    if (args.length) {
        const raw = args.join(' ')
        if (raw.includes('|')) {
            const [warna, isi] = raw.split('|')
            text = (isi || '').trim()
            color = colorMap[warna.trim().toLowerCase()] || 'white'
        } else {
            text = raw.trim()
        }
    } else if (m.quoted?.text) {
        text = m.quoted.text.trim()
    } else {
        return m.reply(`Contoh:
${usedPrefix + command} halo
${usedPrefix + command} merah| halo
Reply teks lalu ${usedPrefix + command}

List warna:
${listWarna}`)
    }

    if (!text) return m.reply('Teks kosong!')
    if (text.length > 120) text = text.slice(0, 120)

    let sender = normalizeJid(m.sender)

    let nama = m.pushName || await conn.getName(sender).catch(() => 'User')

    let avatar = 'https://files.catbox.moe/nwvkbt.png'
    try {
        let pp = await conn.profilePictureUrl(sender, 'image')

        if (typeof pp === 'string' && pp.startsWith('http')) {
            avatar = pp
        }
    } catch {}

    // fallback terakhir
    if (typeof avatar !== 'string' || !avatar.startsWith('http')) {
        avatar = 'https://files.catbox.moe/nwvkbt.png'
    }

    const url = `https://api.deline.web.id/maker/qc?text=${encodeURIComponent(text)}&color=${color}&avatar=${encodeURIComponent(avatar)}&nama=${encodeURIComponent(nama)}`

    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000
        })

        const type = res.headers['content-type'] || ''
        if (!type.includes('image')) throw 'API bukan image'

        const stiker = await sticker(res.data, false, global.stickpack, global.stickauth)

        if (!stiker) throw 'Sticker null'

        await conn.sendFile(m.chat, stiker, 'qc.webp', '', m)

    } catch (e) {
        console.error('QC ERROR:', e)
        m.reply('QC gagal, coba lagi.')
    }
}

handler.help = ['qc <warna>|<teks>', 'qc <teks>']
handler.tags = ['sticker']
handler.command = /^qc$/i
handler.limit = true

export default handler