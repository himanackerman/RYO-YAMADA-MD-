import fs from "fs"
import axios from "axios"
import FormData from "form-data"
import fetch from "node-fetch"

async function uploadTelegraph(buffer, filename) {
  try {
    if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp")
    const tempPath = "./tmp/" + filename
    fs.writeFileSync(tempPath, buffer)

    const form = new FormData()
    form.append("images", fs.createReadStream(tempPath))

    const { data } = await axios.post(
      "https://telegraph.zorner.men/upload",
      form,
      { headers: form.getHeaders() }
    )

    fs.unlinkSync(tempPath)
    return data?.links?.[0] || null
  } catch {
    return null
  }
}

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    await m.react("✨")

    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || q.msg?.mimetype || ""

    if (!mime.startsWith("image/")) {
      let list = handler.help.map(v => `.${v}`).join("\n")
      return m.reply(
`✨ *AI IMAGE CONVERTER*

Reply gambar dengan caption salah satu command berikut:

${list}`
      )
    }

    let buffer = await q.download()
    if (!buffer) return m.reply("❌ Gagal mengambil gambar")

    let ext = mime.split("/")[1] || "jpg"
    let filename = `faa_${Date.now()}.${ext}`

    let imageUrl = await uploadTelegraph(buffer, filename)
    if (!imageUrl) return m.reply("❌ Upload ke Telegraph gagal")

    let apiUrl = `https://api-faa.my.id/faa/${command}?url=${encodeURIComponent(imageUrl)}`
    let res = await fetch(apiUrl)
    if (!res.ok) return m.reply("❌ API error")

    let result = Buffer.from(await res.arrayBuffer())
    await conn.sendFile(m.chat, result, `${command}.jpg`, "", m)
  } catch {
    m.reply("❌ Terjadi kesalahan!")
  }
}

handler.help = [
  'tobotak','tochibi','tofunk',
  'tofigura','tofigurav2','tofigurav3','toghibli','tohijab',
  'tojapanese','tojepang','tokacamata','tokamboja','tolego',
  'toliquor','tomaid','tomirror','tomoai','tomonyet',
  'topacar','topeci','topiramida','toputih','toreal',
  'toroblox','toroh','totato','totua','toviking',
  'tozombie','tounderground','tohitam'
]

handler.tags = ['maker']
handler.command = /^(tobotak|tochibi|tofunk|tofigura|tofigurav2|tofigurav3|toghibli|tohijab|tojapanese|tojepang|tokacamata|tokamboja|tolego|toliquor|tomaid|tomirror|tomoai|tomonyet|topacar|topeci|topiramida|toputih|toreal|toroblox|toroh|totato|totua|toviking|tozombie|tounderground|tohitam)$/i
handler.limit = true

export default handler