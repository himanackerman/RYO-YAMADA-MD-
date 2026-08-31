import fetch from 'node-fetch'
import { exec as execCallback } from 'child_process'
import { writeFileSync, unlinkSync, readFileSync } from 'fs'
import { promisify } from 'util'

const exec = promisify(execCallback)

const AvailableVoices = {
  nahida: 'nahida',
  nami: 'nami',
  ana: 'ana',
  optimus: 'optimus_prime',
  goku: 'goku',
  elon: 'elon_musk',
  mickey: 'mickey_mouse',
  kendrick: 'kendrick_lamar',
  eminem: 'eminem'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [model, ...rest] = text.split(" ")
  let message = rest.join(" ")

  if (!model || !message)
    return m.reply(
`🗣️ *Cara pakai:*
${usedPrefix + command} <model> <teks>

📌 *Daftar suara:*
${Object.keys(AvailableVoices).join(", ")}

Contoh:
${usedPrefix + command} nahida halo hilman`
    )

  model = model.toLowerCase()

  if (!AvailableVoices[model])
    return m.reply(
`❌ Model tidak ditemukan!

📌 *List model:* 
${Object.keys(AvailableVoices).join(", ")}`)
  
  await m.reply(`🎤 Membuat suara *${model}* ...`)

  try {
    let api = `https://api-faa.my.id/faa/tts-legkap?text=${encodeURIComponent(message)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json?.result) throw 'Gagal ambil list suara.'

    // FIX: trim & case-insensitive
    let selected = json.result.find(v => 
      String(v.model).trim().toLowerCase() === AvailableVoices[model].toLowerCase()
      && v.url
    )

    if (!selected)
      return m.reply(`❌ Suara *${model}* tidak tersedia.`)

    let audioRes = await fetch(selected.url)
    let wav = Buffer.from(await audioRes.arrayBuffer())

    let input = `./tmp_${model}.wav`
    let output = `./tmp_${model}.opus`

    writeFileSync(input, wav)

    await exec(`ffmpeg -y -i ${input} -c:a libopus -b:a 64k ${output}`)

    let opus = readFileSync(output)

    await conn.sendMessage(m.chat, {
      audio: opus,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      caption: `🎤 *${selected.voice_name || model}*`
    }, { quoted: m })

    unlinkSync(input)
    unlinkSync(output)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error saat membuat suara TTS.')
  }
}

handler.help = ['ttsvoice <model> <teks>']
handler.tags = ['voice']
handler.command = /^ttsvoice$/i

export default handler