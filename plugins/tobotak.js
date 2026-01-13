// ToBotak
// API : https://api.nekolabs.my.id
// Author : Hilman
import fetch from "node-fetch"
import FormData from "form-data"
import cheerio from "cheerio"

async function uploadImage(buffer) {
  const form = new FormData()
  form.append("file", buffer, { filename: "upload.jpg" })

  const res = await fetch("https://upfilegh.alfiisyll.biz.id/upload", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  })

  const html = await res.text()
  const $ = cheerio.load(html)
  return $("#rawUrlLink").attr("href")
}

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || q.mediaType || ""

  if (!/^image/.test(mime)) return m.reply(`🍭 Balas gambar dulu!\nContoh: ${usedPrefix}${command}`)
  
  m.reply('✨ Sedang memproses botak…')

  const promptBotak = `Edit the character in the picture to remove all hair, leaving a completely bald head. Preserve all facial features, expressions, and clothing. Make the result look realistic and natural.`

  try {
    const buffer = await q.download()
    const imageUrl = await uploadImage(buffer)
    if (!imageUrl) throw new Error("🍬 Gagal upload gambar.")

    const api = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(promptBotak)}&imageUrl=${encodeURIComponent(imageUrl)}`
    const res = await fetch(api)
    const json = await res.json()

    if (!json.result) throw new Error("🍬 API tidak mengembalikan hasil.")

    const result = await fetch(json.result)
    const resultBuffer = await result.buffer()

    await conn.sendMessage(m.chat, { image: resultBuffer, caption: `✨ *Hasil Botak*` }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply(`❌ Yahh error!\nError: ${e.message}`)
  }
}

handler.help = ["tobotak"]
handler.tags = ["ai", "tools"]
handler.command = /^tobotak$/i
handler.limit = true
handler.register = true

export default handler