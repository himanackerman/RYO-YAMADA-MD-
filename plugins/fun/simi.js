import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Contoh: ${usedPrefix + command} halo`
    try {
        let res = await fetch(`https://api.nexray.web.id/ai/simisimi?text=${encodeURIComponent(text)}`)
        let json = await res.json()
        if (json.status) {
            await conn.sendMessage(m.chat, { text: json.result }, { quoted: m })
        } else {
            throw 'Gagal mendapatkan respon dari Simi.'
        }
    } catch (e) {
        throw 'Terjadi kesalahan sistem.'
    }
}

handler.help = ['simi']
handler.tags = ['fun']
handler.command = ['simi', 'simisimi']

export default handler