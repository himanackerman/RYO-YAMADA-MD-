/*
creator : hilman 
ryo Yamada md
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

const devices = [
  "desktop_hd",
  "desktop_fhd",
  "desktop_4k",
  "desktop_wide",
  "laptop_13",
  "laptop_15",
  "macbook_air",
  "macbook_pro",
  "ipad",
  "ipad_pro",
  "ipad_mini",
  "samsung_tab",
  "iphone_se",
  "iphone_14",
  "iphone_14_pro",
  "iphone_15_pro",
  "samsung_s24",
  "pixel_8",
  "xiaomi_14"
]

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `Contoh:\n${usedPrefix + command} https://example.com`
  }

  if (text.includes("|")) {
    const [device, encodedUrl] = text.split("|").map(v => v.trim())
    const url = decodeURIComponent(encodedUrl)

    await m.react("🍀")

    const api = global.APIs.kyzzz
    const apikey = global.APIKeys[api]

    const res = await fetch(
      `${api}/api/tools/record?url=${encodeURIComponent(url)}&device=${device}&scroll=true&dark_mode=true&apikey=${apikey}`
    )

    const json = await res.json()

    if (!json.status) throw json.message || "Gagal merekam website."

    const d = json.result

    return await conn.sendMessage(m.chat, {
      video: { url: d.url },
      mimetype: "video/mp4",
      fileName: d.filename,
      caption: `*\`Website Record\`*

✿ *\`URL\`* : ${url}
✿ *\`Device\`* : ${d.device_label}
✿ *\`Resolusi\`* : ${d.width}×${d.height}
✿ *\`Tipe\`* : ${d.type}
✿ *\`Expired\`* : ${d.expires_in_seconds} detik`
    }, { quoted: m })
  }

  const rows = devices.map(device => ({
    title: device,
    description: `Gunakan device ${device}`,
    id: `${usedPrefix + command} ${device}|${encodeURIComponent(text)}`
  }))

  return await conn.sendMessage(m.chat, {
    text: `Pilih device untuk merekam website.\n\nURL : ${text}`,
    footer: "Website Record",
    nativeFlow: [{
      text: "❀ Pilih Device",
      sections: [{
        title: "Daftar Device",
        rows
      }]
    }]
  }, { quoted: m })
}

handler.help = ["rcweb <url>", "recordweb <url>"]
handler.tags = ["tools"]
handler.command = /^(rcweb|recordweb)$/i
handler.limit = true

export default handler