// • MediaFire Download 
// • Type : Plugins ESM 
// • Scrape : https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/740
// • Author : Hilman 
import fetch from "node-fetch"

let handler = async (m, { conn, args }) => {
  let url = args[0]
  if (!url || !/^https?:\/\/(www\.)?mediafire\.com/.test(url)) {
    return conn.reply(m.chat, "🍭 Kirim link MediaFire yang valid!", m)
  }

  try {
    const res1 = await fetch("https://staging-mediafire-direct-url-ui-txd2.frontend.encr.app/api/mediafire/taskid", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "accept-language": "id-ID"
      }
    })

    const { taskId } = await res1.json()

    const res2 = await fetch(`https://staging-mediafire-direct-url-ui-txd2.frontend.encr.app/api/mediafire/download/${taskId}`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "accept-language": "id-ID"
      },
      body: JSON.stringify({ url })
    })

    const { fileName, downloadUrl } = await res2.json()
    if (!downloadUrl) throw "🍬 Link tidak ditemukan atau gagal diproses."

    const buffer = await fetch(downloadUrl).then(r => r.buffer())
    if (!buffer || buffer.length === 0) throw "🍬 Gagal ambil file dari link."

    await conn.sendFile(m.chat, buffer, fileName, `✨ *${fileName}*`, m)
  } catch (e) {
    conn.reply(m.chat, "🍬 Gagal kirim file: " + (e.message || "Unknown error"), m)
  }
}

handler.help = ["mediafire <url>"]
handler.tags = ["downloader"]
handler.command = /^(mediafire|mf(dl)?)$/i;
handler.limit = true
handler.register = true

export default handler