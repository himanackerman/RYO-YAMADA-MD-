/**
 * to hitam dan lain lain
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 Api : https://api-faa.my.id
 */
import axios from "axios"
import FormData from "form-data"
import fetch from "node-fetch"

async function uguu(buffer) {
  try {
    const form = new FormData()
    form.append("files[]", buffer, "image.jpg")

    const { data } = await axios.post(
      "https://uguu.se/upload",
      form,
      { headers: form.getHeaders() }
    )

    return data?.files?.[0]?.url || null
  } catch {
    return null
  }
}

let handler = async (m, { conn, command }) => {
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

    let imageUrl = await uguu(buffer)
    if (!imageUrl) return m.reply("❌ Upload gambar gagal")

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

handler.tags = ['image']

handler.command = /^(tobotak|tochibi|tofunk|tofigura|tofigurav2|tofigurav3|toghibli|tohijab|tojapanese|tojepang|tokacamata|tokamboja|tolego|toliquor|tomaid|tomirror|tomoai|tomonyet|topacar|topeci|topiramida|toputih|toreal|toroblox|toroh|totato|totua|toviking|tozombie|tounderground|tohitam)$/i

handler.limit = true
export default handler