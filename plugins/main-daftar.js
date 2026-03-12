/*
✨ YuriPuki
💫 Nama Fitur: Daftar
🤖 Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VbATaq46BIErAvF4mv2c
*/

import { createHash } from 'crypto'
import moment from 'moment-timezone'

let Reg = /^([\w\s]+)\s*,\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let namae = conn.getName(m.sender)
  let d = new Date(new Date() + 3600000)
  let locale = 'id'
  let week = d.toLocaleDateString(locale, { weekday: 'long' })
  let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let wibh = moment.tz('Asia/Jakarta').format('HH')
  let wibm = moment.tz('Asia/Jakarta').format('mm')
  let wibs = moment.tz('Asia/Jakarta').format('ss')
  let wktuwib = `${wibh} H ${wibm} M ${wibs} S`

  let pp
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    pp = './src/avatar_contact.png'
  }

  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(`❗ Kamu sudah terdaftar!\n\nMau daftar ulang?\nKetik:\n${usedPrefix}unreg ${sn}`)
  }

  if (!Reg.test(text)) {
    return m.reply(
      `Ketik dengan format:\n\n${usedPrefix + command} namamu,umurmu\n\nContoh:\n${usedPrefix + command} hilman,18\n${usedPrefix + command} hilman, 18`
    )
  }

  let [_, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('*Nama atau umur tidak valid!*')
  if (name.length > 100) return m.reply('Nama maksimal 100 karakter.')
  if (age < 5 || age > 100) return m.reply('Umur harus antara 5 - 100 tahun.')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  let caption = `
「 *PENDAFTARAN BERHASIL* 」
│ ✅ *Status:* Terdaftar
│ ✨ *Nama:* ${name}
│ 🎂 *Umur:* ${age} Tahun
│ 🔐 *SN Key:* ${sn}
│
│ 📅 *Tanggal:* ${week}, ${date}
│ ⏰ *Waktu:* ${wktuwib}

Selamat datang di sistem bot!
Data kamu sudah tersimpan di database.
Semoga harimu menyenangkan~!
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption,
    footer: 'Pilih tombol di bawah untuk lanjut:',
    buttons: [
      {
        buttonId: '.menu',
        buttonText: { displayText: '📂 Menu Utama' },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m })
}

handler.help = ['daftar']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler
