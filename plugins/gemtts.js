import axios from "axios"
import ffmpeg from "fluent-ffmpeg"
import { PassThrough } from "stream"

const api_url = "https://firebasevertexai.googleapis.com/v1beta"
const model_url = "projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models"
const headers = {
  "content-type": "application/json",
  "x-goog-api-client": "gl-kotlin/2.1.0-ai fire/16.5.0",
  "x-goog-api-key": "AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk"
}

// Voice yang tersedia
const voices = [
  "leda", "aoede", "thalia", "charon",
  "sabrina", "puck", "calliope",
  "orpheus", "theseus", "hercules"
]

// ========================
//  SCRAPE TTS
// ========================
async function tts(text, voice = "leda", { model = "gemini-2.5-flash-preview-tts", delay = 1000 } = {}) {
  if (!text) throw "Text is required"

  const body = {
    contents: [
      {
        role: "model",
        parts: [
          {
            text: "[selalu gunakan bahasa indonesia, selalu gunakan gaya bicara yang imut, gemes, lembut, ramah, sopan, dan friendly.]"
          }
        ]
      },
      { role: "user", parts: [{ text }] }
    ],
    generationConfig: {
      responseModalities: ["audio"],
      temperature: 1,
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: voice.charAt(0).toUpperCase() + voice.slice(1)
          }
        }
      }
    }
  }

  let attempt = 1
  while (true) {
    try {
      const res = await axios.post(
        `${api_url}/${model_url}/${model}:generateContent`,
        body,
        { headers }
      )

      const parts = res.data?.candidates?.[0]?.content?.parts
      if (!parts) throw "No parts in response"

      const audioParts = parts.filter(p => p.inlineData)
      if (!audioParts.length) throw "No audio data found"

      const combined = audioParts.map(p => p.inlineData.data).join("")
      const ogg = await convertPCMToOggOpus(combined)

      return ogg
    } catch (e) {
      console.log(`TTS attempt ${attempt} gagal: ${e}`)
      await new Promise(r => setTimeout(r, delay))
      delay = Math.min(delay * 1.2, 60000)
      attempt++
    }
  }
}

async function convertPCMToOggOpus(base64Data) {
  return new Promise((resolve, reject) => {
    const pcmBuffer = Buffer.from(base64Data, "base64")
    const input = new PassThrough()
    input.end(pcmBuffer)

    const output = new PassThrough()
    const chunks = []

    output.on("data", c => chunks.push(c))
    output.on("end", () => resolve(Buffer.concat(chunks)))
    output.on("error", reject)

    ffmpeg(input)
      .inputOptions(["-f s16le", "-ar 24000", "-ac 1"])
      .toFormat("ogg")
      .audioCodec("libopus")
      .audioBitrate(64)
      .audioFrequency(24000)
      .audioChannels(1)
      .outputOptions(["-compression_level 10"])
      .on("error", err => reject(err))
      .pipe(output)
  })
}

// ========================
//  HANDLER
// ========================
let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `Cara pakai:\n` +
      `.gemtts [voice optional] [teks]\n\n` +
      `Contoh:\n` +
      `.gemtts leda halo kamu lucu\n` +
      `.gemtts orpheus selamat malam\n\n` +
      `Voice tersedia:\n${voices.join(", ")}`
    )
  }

  let voice = args[0].toLowerCase()
  let text = args.slice(1).join(" ")

  // Jika voice tidak ada → dianggap text
  if (!voices.includes(voice)) {
    text = args.join(" ")
    voice = "leda"
  }

  if (!text) return m.reply("Teksnya mana bang?")

  try {
    const audio = await tts(text, voice)

    await conn.sendMessage(
      m.chat,
      {
        audio,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply("Gagal membuat suara.")
  }
}

handler.help = ["gemtts"]
handler.tags = ["ai"]
handler.command = /^gemtts$/i
handler.limit = false

export default handler