// plugins/ytaudio.js
import fetch from "node-fetch"

const yt = {
  url: Object.freeze({
    base128: "https://api.apiapi.lat",
    referrer: "https://ogmp3.pro/"
  }),

  encUrl: (str) => str.split("").map(c => c.charCodeAt()).reverse().join(";"),
  xor: (str) => str.split("").map(s => String.fromCharCode(s.charCodeAt() ^ 1)).join(""),
  rand: () => {
    const hex = "0123456789abcdef".split("")
    return Array.from({ length: 32 }, _ => hex[Math.floor(Math.random() * hex.length)]).join("")
  },

  init: async function (ytUrl, format = 0, mp3q = 128) {
    const rand1 = this.rand()
    const rand2 = this.rand()
    const api = `${this.url.base128}/${rand1}/init/${this.encUrl(ytUrl)}/${rand2}/`
    const ytUrlXor = this.xor(ytUrl)

    const res = await fetch(api, {
      method: "POST",
      body: JSON.stringify({
        data: ytUrlXor,
        format: format + "",
        referer: "",
        mp3Quality: mp3q,
        mp4Quality: 240,
        userTimeZone: "-480"
      })
    })

    if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${await res.text()}`)
    const json = await res.json()
    const { i, pk, s } = json
    if (s === "C") return this.generateFileUrl(i, pk)
    return await this.statusCheck(i, pk)
  },

  generateFileUrl: async function (i, pk) {
    const pkVal = pk ? pk + "/" : ""
    const rand1 = this.rand()
    const rand2 = this.rand()
    return `${this.url.base128}/${rand1}/download/${i}/${rand2}/${pkVal}`
  },

  statusCheck: async function (i, pk) {
    let json = {}
    do {
      await new Promise(r => setTimeout(r, 5000))
      const pkVal = pk ? pk + "/" : ""
      const rand1 = this.rand()
      const rand2 = this.rand()
      const api = `${this.url.base128}/${rand1}/status/${i}/${rand2}/${pkVal}`

      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: i })
      })

      if (!res.ok) throw new Error(`${res.status} ${res.statusText} ${await res.text()}`)
      json = await res.json()
    } while (json.s === "P")

    if (json.s === "E") throw new Error("❌ Gagal proses:\n" + JSON.stringify(json, null, 2))
    return this.generateFileUrl(i, pk)
  }
}

let handler = async (m, { conn, args }) => {
  await m.react('🕒')

  const url = args[0]
  if (!url || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)) {
    return conn.reply(m.chat, "🔗 Kirim URL YouTube yang valid!", m)
  }

  try {
    const dlUrl = await yt.init(url)
    const buffer = await fetch(dlUrl).then(r => r.buffer())

    if (buffer.length > 50 * 1024 * 1024) {
      return conn.reply(m.chat, `📥 File terlalu besar untuk dikirim langsung.\n🔗 Link download: ${dlUrl}`, m)
    }

    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, "❌ Gagal ambil audio:\n" + (e.message || "Unknown error"), m)
  }
}

handler.help = ["yta <url>"]
handler.tags = ["downloader"]
handler.command = /^yta$/i
handler.limit = true

export default handler