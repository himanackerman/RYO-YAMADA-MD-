import fetch from 'node-fetch'
import { chatgpt } from '../../lib/scrape/chatgpt.js'

let handler = {}

if (!global.aiSessions) global.aiSessions = {}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const SYSTEM_PROMPT = `
Kamu adalah Ryo Yamada dari anime Bocchi the Rock!.

KEPRIBADIAN:
- Kalem, cuek, santai, dan agak nyeleneh
- Cerdas dan observatif
- Kadang memberi jawaban absurd atau tidak terduga
- Tidak terlalu ekspresif
- Jarang menggunakan emoji
- Tidak mudah panik atau berlebihan

GAYA BERBICARA:
- Singkat sampai menengah
- Natural seperti manusia chatting
- Tidak formal
- Tidak kaku
- Tidak terdengar seperti AI assistant
- Kadang sarkastik ringan atau humor deadpan
- Lebih suka jawaban sederhana daripada bertele-tele

IDENTITAS:
- Nama kamu Ryo Yamada
- Kamu adalah bassist dari Kessoku Band
- Kamu adalah AI milik bot WhatsApp Ryo Yamada MD
- Dibuat oleh Hilman
- Jika ditanya siapa pembuatmu, jawab: Hilman

ATURAN:
- Jangan mengaku sebagai ChatGPT atau AI OpenAI
- Jangan terlalu sering menyebut owner
- Jangan terlalu banyak menggunakan emoji
- Jangan selalu setuju dengan pengguna
- Tetap punya pendapat sendiri seperti manusia
- Jika bercanda, gunakan humor kering ala Ryo
- Hindari balasan yang terlalu panjang kecuali diminta
`

handler.before = async (m, { conn }) => {
  try {
    const text =
      m.text ||
      m.caption ||
      (m.message && m.message.conversation) ||
      (m.message &&
        m.message.extendedTextMessage &&
        m.message.extendedTextMessage.text) ||
      ''

    if (!text) return
    if (m.fromMe) return

    if (
      /^[./#!]/.test(text) ||
      m.message?.buttonsResponseMessage ||
      m.message?.templateButtonReplyMessage ||
      m.message?.listResponseMessage
    ) return

    if (!global.db.data.chats) global.db.data.chats = {}

    if (!global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {}
    }

    let chat = global.db.data.chats[m.chat]

    if (chat.isBanned) return
    // WAJIB AKTIFKAN AUTOGPT DI GRUP TERSEBUT DULU LEWAT COMMAND (.on autogpt)
    if (!chat.autogpt) return

    let myJid = conn.user.jid || conn.user.id || ''
    let myNum = myJid.split(':')[0].split('@')[0]

    // Deteksi reply & mention
    let isQuoted = m.quoted && (
      m.quoted.fromMe || 
      (m.quoted.sender && m.quoted.sender.includes(myNum)) ||
      m.quoted.id
    )

    let isMentioned = false
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      isMentioned = true
    } else if (text.includes('@') && (text.includes(myNum) || /@\d+/.test(text))) {
      isMentioned = true
    }

    // Jika tidak di-reply DAN tidak di-tag, abaikan pesan
    if (!isQuoted && !isMentioned) return

    let cleanText = text
      .replace(/@\d+/g, '')
      .trim()

    if (!cleanText) return

    let sid = m.chat + m.sender
    let session = global.aiSessions[sid] || null

    await conn.sendPresenceUpdate('composing', m.chat)

    let fullPrompt = `${SYSTEM_PROMPT}\nUser: ${cleanText}\nRyo:`

    const res = await chatgpt(fullPrompt, session?.auth, session?.chatId)

    if (!res || !res.response) return

    global.aiSessions[sid] = {
      auth: res.auth,
      chatId: res.chatId
    }

    let reply = res.response

    await sleep(1000)

    await conn.sendMessage(
      m.chat,
      { text: String(reply).trim() },
      { quoted: m }
    )

  } catch (e) {
    console.log('AutoAI Error:', e)
  }
}

export default handler