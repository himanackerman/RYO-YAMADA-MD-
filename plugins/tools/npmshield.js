/**
 ╔══════════════════════
      ⧉  [npmshield] — [tools]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Note    : menyediakan quick info berbasis badge, bukan untuk analisis data mendalam atau perhitungan presisi, ditanya berguna engga nya juga kurang tau v:
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`*Contoh:* ${usedPrefix + command} /npm/dw/react`)
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let path = text.trim()
        if (!path.startsWith('/')) {
            return m.reply(`🍂 *Path tidak valid.*\nGunakan:\n*/npm/dw/react*`)
        }

        const url = `https://img.shields.io${path}?format=json`

        const res = await fetch(url, {
            headers: {
                "user-agent": "Mozilla/5.0",
                "accept": "application/json,image/svg+xml"
            }
        })

        if (!res.ok) {
            return m.reply(`🍂 *Fetch gagal.*\nStatus: *${res.status}*`)
        }

        const type = res.headers.get('content-type') || ''

        if (type.includes('application/json')) {
            const data = await res.json()

            let output = `📦 *Shields.io Badge Info*\n\n`
            output += `🏷️ *Label:* ${data.label || '-'}\n`
            output += `📊 *Value:* ${data.message || '-'}\n`
            output += `🎨 *Color:* ${data.color || '-'}\n`

            if (data.namedLogo) {
                output += `🧩 *Logo:* ${data.namedLogo}\n`
            }

            return m.reply(output)
        }

        const svg = await res.text()

        const texts = [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)]
            .map(v => v[1].replace(/&[^;]+;/g, '').trim())
            .filter(Boolean)

        if (texts.length >= 2) {
            let output = `📦 *Shields.io Badge Info (SVG)*\n\n`
            output += `🏷️ *Label:* ${texts[0]}\n`
            output += `📊 *Value:* ${texts[texts.length - 1]}\n`
            output += `🖼️ *Source:* SVG fallback\n`

            return m.reply(output)
        }

        throw new Error('SVG parse failed')
    } catch (e) {
        await m.reply(`🍂 *Gagal memproses badge.*\nEndpoint tidak bisa dibaca.`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['npmshield'];
handler.tags = ['tools'];
handler.command = /^(npmshield)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler