/**
 * ✧ Text To Sound Blue Archive [ttsba]✧
 * ✧ Type: Plugin ESM
 * ✧ Source: https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * ✧ Modified by: Lznycx
 */

import fs from 'fs'
import moment from 'moment-timezone'

const blueArchiveChars = [
  "Airi", "Akane", "Akari", "Ako", "Aris", "Arona", "Aru", "Asuna", "Atsuko",
  "Ayane", "Azusa", "Cherino", "Chihiro", "Chinatsu", "Chise", "Eimi", "Erica",
  "Fubuki", "Fuuka", "Hanae", "Hanako", "Hare", "Haruka", "Haruna", "Hasumi",
  "Hibiki", "Hifumi", "Himari", "Hina", "Hinata", "Hiyori", "Hoshino", "Iori",
  "Iroha", "Izumi", "Izuna", "Juri", "Kaede", "Karin", "Kayoko", "Kazusa",
  "Kirino", "Koharu", "Kokona", "Kotama", "Kotori", "Maki", "Mari",
  "Marina", "Mashiro", "Michiru", "Midori", "Miku", "Mimori", "Misaki", "Miyako",
  "Miyu", "Moe", "Momoi", "Momoka", "Mutsuki", "Natsu", "Neru", "Noa",
  "Nodoka", "Nonomi", "Pina", "Rin", "Saki", "Saori", "Saya", "Sena", "Serika",
  "Serina", "Shigure", "Shimiko", "Shiroko", "Shizuko", "Shun", "Sora", 
  "Sumire", "Suzumi", "Tomoe", "Tsubaki", "Tsurugi", "Ui", "Utaha",
  "Wakamo", "Yoshimi", "Yuuka", "Yuzu", "Zunko"
]

let voiceQueue = {}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const user = m.sender
    
    if (!args[0]) {
      return conn.reply(m.chat,
        `🎤 *Blue Archive Text-to-Speech*\n\n` +
        `Kirim perintah dengan format:\n` +
        `${usedPrefix + command} [teks]\n\n` +
        `Contoh:\n` +
        `${usedPrefix + command} Arona, kita belajar yuk!`,
        m
      )
    }

    const text = args.join(" ")
    voiceQueue[user] = text


    let charList = '📚 *Daftar Karakter Blue Archive*\n'
    charList += `📝 Teks: "${text.length > 30 ? text.slice(0, 30) + '...' : text}"\n\n`
    
    blueArchiveChars.forEach((char, i) => {
      charList += `${i + 1}. ${char}\n`
    })

    charList += `\n🕒 ${moment.tz('Asia/Jakarta').format('HH:mm:ss')} | Total: ${blueArchiveChars.length} karakter\n\n`
    charList += `Balas dengan nomor karakter yang dipilih`

    await conn.reply(m.chat, charList, m)

  } catch (e) {
    console.error('Error:', e)
    conn.reply(m.chat, `❌ Gagal memproses permintaan\n${e.message}`, m)
  }
}

handler.before = async (m, { conn }) => {
  const user = m.sender
  if (!voiceQueue[user]) return
  
  const charIndex = parseInt(m.text) - 1
  if (isNaN(charIndex) || charIndex < 0 || charIndex >= blueArchiveChars.length) return
  
  const selectedChar = blueArchiveChars[charIndex]
  const text = voiceQueue[user]
  delete voiceQueue[user]

  try {
    await conn.reply(m.chat, `⏳ Memproses suara ${selectedChar}...`, m)
    
    const apiUrl = `https://api.hiuraa.my.id/tools/ttsba?text=${encodeURIComponent(text)}&char=${encodeURIComponent(selectedChar)}&speed=1`
    const response = await fetch(apiUrl)
    
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    
    const audioBuffer = await response.arrayBuffer()
    if (!audioBuffer || audioBuffer.byteLength === 0) throw new Error("Audio kosong")
    
    await conn.sendMessage(m.chat, { 
      audio: Buffer.from(audioBuffer), 
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {
        mentionedJid: [user],
        externalAdReply: {
          title: `${selectedChar} - Blue Archive TTS`,
          body: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
          thumbnailUrl: "https://i.ibb.co/0jqWZ4N/ba-tts.jpg",
          sourceUrl: "https://bluearchive.nexon.com"
        }
      }
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error:', e)
    conn.reply(m.chat, `❌ Gagal membuat suara ${selectedChar}\n${e.message}`, m)
  }
}

handler.help = ["ttsba <teks>"]
handler.tags = ["tools", "internet"]
handler.command = /^(ttsba|batt?s)$/i
handler.limit = true
handler.premium = false
handler.register = true

export default handler