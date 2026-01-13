/*
• Nama Fitur  : Image To Anime AI
• Type  : Plugin ESM
• Source scrape : https://whatsapp.com/channel/0029Vb7AafUL7UVRIpg1Fy24/142
• Author : Hilman
*/

import axios from "axios"
import { fileTypeFromBuffer } from "file-type"

class Img2Anime {
  constructor() {
    this.API_URL = "https://aienhancer.ai/api/v1/r/image-enhance/create"
    this.RESULT_URL = "https://aienhancer.ai/api/v1/r/image-enhance/result"
    this.HEADERS = {
      "accept": "*/*",
      "content-type": "application/json",
      "Referer": "https://aienhancer.ai",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    }

    this.STYLE_PAYLOADS = {
      manga: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s0+xiFV3y4sbetHMN7rHh7DRIpuIQD4rKISR/vE+HeaHpRavXfsilr5P7Y6bsIo+RRFIPgX2ofbYYiATziqsjDeie4IlcOAVf1Pudqz8uk6YKM78CGxjF9iPLYQnkW+c6j96PNsg1Yk4Xz8/ZcdmHF4GGZe8ILYH/D0yyM1dsCkK1zY8ciL+6pAk4dHIZ/4k9A==",
      ghibli: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4syzL5EYHGJWC1rlQM9xhNe1PViOsBSxmwHVwOdqtxZtcAJmGuzTgG7JVU7Hr9ZRwajhYK5yxQwSdJGwwR4jjS1yF9s9wKUQqgI+fYxaw7FZziLS+9JG5pTEjch4D0fpl+LO7vIynHN4cyu4DDeAUwNeYfbGMn2QQs+5OgMdViCAM1GkJk2jhlQm10rESTjDryw==",
      anime: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s7O2FxvQPCjt2uGmHPMOx1DsNSnLvzCKPVdz8Ob1cPHePmmquQZlsb/p+8gGv+cizSiOL4ts6GD2RxWN+K5MmpA/F3rQXanFUm4EL0g7qZCQbChRRQyaAyZuxtIdTKsmsMzkVKM5Sx96eV7bEjUAJ52j6NcP96INv2DhnWTP7gB6tltFQe8B8SPS2LuLRuPghA=="
    }

    this.POLLING_INTERVAL = 2000
    this.MAX_POLLING_ATTEMPTS = 120
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async createTask(buffer, style) {
    const type = await fileTypeFromBuffer(buffer)
    if (!type) throw "Format gambar tidak dikenali."

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"]
    if (!allowed.includes(type.mime)) {
      throw `Format ${type.mime} tidak didukung.`
    }

    const base64Img = `data:${type.mime};base64,${buffer.toString("base64")}`
    const settingsPayload = this.STYLE_PAYLOADS[style]
    if (!settingsPayload) throw "Style tidak valid (anime / manga / ghibli)."

    const { data } = await axios.post(
      this.API_URL,
      {
        model: 5,
        image: base64Img,
        settings: settingsPayload
      },
      { headers: this.HEADERS }
    )

    if (data.code !== 100000 || !data.data?.id) {
      throw "Gagal membuat task."
    }

    return data.data.id
  }

  async checkTask(taskId) {
    const { data } = await axios.post(
      this.RESULT_URL,
      { task_id: taskId },
      { headers: this.HEADERS }
    )
    return data
  }

  async generate(buffer, style = "anime") {
    const taskId = await this.createTask(buffer, style)

    for (let i = 0; i < this.MAX_POLLING_ATTEMPTS; i++) {
      const res = await this.checkTask(taskId)

      if (res.code !== 100000) throw "Gagal cek status task."

      const d = res.data
      if (d.status === "succeeded" && d.output) {
        return d.output
      }

      if (d.status === "failed") {
        throw "Proses gagal."
      }

      await this.sleep(this.POLLING_INTERVAL)
    }

    throw "Timeout menunggu hasil."
  }
}

const client = new Img2Anime()

let handler = async (m, { conn, args }) => {
  const style = (args[0] || "anime").toLowerCase()

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ""

  if (!mime.includes("image")) {
    return m.reply("❗ Reply gambar dengan caption:\n.img2anime anime|manga|ghibli")
  }

  try {
    const media = await q.download()
    if (!media) return m.reply("❌ Gagal download gambar.")

    await conn.reply(m.chat, global.wait, m)

    const resultUrl = await client.generate(media, style)

    return conn.sendMessage(
      m.chat,
      {
        image: { url: resultUrl },
        caption: `✨ *IMAGE TO ${style.toUpperCase()}*`
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    return m.reply("❌ Error: " + e)
  }
}

handler.help = ["img2anime"]
handler.tags = ["ai"]
handler.command = ["img2anime"]
handler.limit = true
handler.register = true

export default handler