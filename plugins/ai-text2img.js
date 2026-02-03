/*
✨ YuriPuki
💫 Nama Fitur: TextToImage
🤖 Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import axios from "axios"

const getImageUrl = (prompt) => {
  const seed = Date.now().toString() + Math.floor(Math.random() * 1e6).toString()
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&enhance=true&nologo=true&model=flux`
}

let handler = async (m, { text, conn }) => {
  if (!text) throw 'Masukkan prompt, contoh: .text2img Polisi tilang warga sambil minta duit'

  const urlImage = getImageUrl(text)
  await conn.sendMessage(m.chat, {
    image: { url: urlImage },
    caption: `🖼️ Prompt: ${text}`
  }, { quoted: m })
}

handler.help = ['text2img <prompt>']
handler.tags = ['ai']
handler.command = /^text2img$/i
handler.limit = true 
handler.register = true

export default handler