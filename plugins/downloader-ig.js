/**
 ╔══════════════════════
      ⧉  [instagram] — [downloader]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Web      : [ https://api.nekolabs.web.id ]
  ✺ Req      : [ 62851752××××× ]
  ✺ Note    : no cap, image album
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} https://www.instagram.com/...*`)
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let api = `https://api.nekolabs.web.id/downloader/instagram?url=${encodeURIComponent(text)}`
        let res = await fetch(api)
        let json = await res.json()

        if (!json.success) throw 'Media tidak ditemukan 🍂'

        let meta = json.result.metadata
        let urls = json.result.downloadUrl

        if (meta.isVideo) {
            let vid = await fetch(urls[0])
            let buffer = Buffer.from(await vid.arrayBuffer())
            await conn.sendMessage(
                m.chat,
                {
                    video: buffer
                },
                { quoted: m }
            )
        } else {
            for (let url of urls) {
                let img = await fetch(url)
                let buffer = Buffer.from(await img.arrayBuffer())
                await conn.sendMessage(
                    m.chat,
                    {
                        image: buffer
                    },
                    { quoted: m }
                )
            }
        }

    } catch (e) {
        m.reply(`*🍂 ERROR TERJADI*\n${e}`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['instagram'];
handler.tags = ['downloader'];
handler.command = /^(instagram|ig|igdl)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler