/*
• Nama Fitur : AI Enhancer (Anime, RemoveBG, Upscale)
• Type       : Plugin ESM
• Source scrape : https://whatsapp.com/channel/0029Vb7AafUL7UVRIpg1Fy24/145
• Author     : Hilman
*/

import axios from "axios"
import { fileTypeFromBuffer } from "file-type"
import CryptoJS from "crypto-js"

const API_URL = "https://aienhancer.ai/api/v1/r/image-enhance/create"
const RESULT_URL = "https://aienhancer.ai/api/v1/r/image-enhance/result"

const HEADERS = {
  "accept": "*/*",
  "content-type": "application/json",
  "Referer": "https://aienhancer.ai",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

const AES_KEY = "ai-enhancer-web__aes-key"
const AES_IV = "aienhancer-aesiv"

const IMAGE_TO_ANIME_PRESETS = {
  anime: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    max_images: 1,
    prompt: "Convert the provided image into an ANIME-STYLE illustration."
  },
  manga: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    max_images: 1,
    prompt: "Convert the provided image into a MANGA illustration."
  },
  ghibli: {
    size: "2K",
    aspect_ratio: "match_input_image",
    output_format: "jpg",
    max_images: 1,
    prompt: "Convert the provided image into a STUDIO GHIBLI style illustration."
  }
}

function encrypt(data) {
  const plaintext = typeof data === "string" ? data : JSON.stringify(data)
  return CryptoJS.AES.encrypt(
    plaintext,
    CryptoJS.enc.Utf8.parse(AES_KEY),
    {
      iv: CryptoJS.enc.Utf8.parse(AES_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function processImage(buffer) {
  const type = await fileTypeFromBuffer(buffer)
  if (!type) throw "Format gambar tidak dikenali."

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowed.includes(type.mime)) {
    throw `Format ${type.mime} tidak didukung.`
  }

  return {
    base64: `data:${type.mime};base64,${buffer.toString("base64")}`,
    mime: type.mime
  }
}

async function createTask(model, buffer, config) {
  const { base64 } = await processImage(buffer)
  const settings = encrypt(config)

  const { data } = await axios.post(
    API_URL,
    {
      model,
      image: base64,
      settings
    },
    { headers: HEADERS }
  )

  if (data.code !== 100000 || !data.data?.id) {
    throw "Gagal membuat task."
  }

  return data.data.id
}

async function pollResult(taskId) {
  for (let i = 0; i < 120; i++) {
    const { data } = await axios.post(
      RESULT_URL,
      { task_id: taskId },
      { headers: HEADERS }
    )

    if (data.code !== 100000) throw "Gagal cek status."

    const d = data.data
    if (d.status === "succeeded" && d.output) {
      return d.output
    }

    if (d.status === "failed") {
      throw "Proses gagal."
    }

    await sleep(2000)
  }

  throw "Timeout menunggu hasil."
}

async function imageToAnime(buffer, style) {
  const preset = IMAGE_TO_ANIME_PRESETS[style]
  if (!preset) throw "Style tidak valid."

  const taskId = await createTask(5, buffer, preset)
  return await pollResult(taskId)
}

async function removeBg(buffer) {
  const config = {
    threshold: 0,
    reverse: false,
    background_type: "rgba",
    format: "png"
  }

  const taskId = await createTask(4, buffer, config)
  return await pollResult(taskId)
}

async function upscale(buffer) {
  const config = {
    scale: 4,
    image_size: "auto",
    output_format: "jpg"
  }

  const taskId = await createTask(3, buffer, config)
  return await pollResult(taskId)
}

let handler = async (m, { conn, args }) => {
  const mode = (args[0] || "").toLowerCase()

  let q = m.quoted || m
  let mime = (q.msg || q).mimetype || ""

  if (!mime.includes("image")) {
    return m.reply(
      "❗ Reply gambar dengan perintah:\n" +
      ".aienhance anime\n" +
      ".aienhance manga\n" +
      ".aienhance ghibli\n" +
      ".aienhance rmbg\n" +
      ".aienhance upscale"
    )
  }

  try {
    const media = await q.download()
    if (!media) return m.reply("❌ Gagal download gambar.")

    await conn.reply(m.chat, global.wait, m)

    let resultUrl

    if (["anime", "manga", "ghibli"].includes(mode)) {
      resultUrl = await imageToAnime(media, mode)
    } else if (mode === "rmbg") {
      resultUrl = await removeBg(media)
    } else if (mode === "upscale") {
      resultUrl = await upscale(media)
    } else {
      return m.reply("❌ Mode tidak valid.")
    }

    return conn.sendMessage(
      m.chat,
      {
        image: { url: resultUrl },
        caption: `✨ *AI ENHANCER (${mode.toUpperCase()})*`
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    return m.reply("❌ Error: " + e)
  }
}

handler.help = ["aienhance"]
handler.tags = ["ai"]
handler.command = ["aienhance"]
handler.limit = true
handler.register = true

export default handler