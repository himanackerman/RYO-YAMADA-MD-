import fs from 'fs'
import { createHash } from 'crypto'
import moment from 'moment-timezone'

const Reg = /^([\w\s]+)\s*,\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  const user = global.db.data.users[m.sender]
  const sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(`Kamu sudah terdaftar.\n\nKetik:\n${usedPrefix}unreg ${sn}`)
  }

  if (!Reg.test(text)) {
    return m.reply(`Contoh:\n${usedPrefix + command} Hilman,18`)
  }

  let [, name, ageStr] = text.match(Reg)
  name = name.trim()
  const age = parseInt(ageStr)

  if (!name || !age) return m.reply('Nama atau umur tidak valid.')
  if (name.length > 100) return m.reply('Nama maksimal 100 karakter.')
  if (age < 5 || age > 100) return m.reply('Umur harus 5 - 100 tahun.')

  const d = new Date()
  const week = d.toLocaleDateString('id', { weekday: 'long' })
  const date = d.toLocaleDateString('id', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const time = moment.tz('Asia/Jakarta').format('HH:mm:ss')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  const caption = `*\`Pendaftaran Berhasil\`*

✿ *\`Nama\`* : ${name}
✿ *\`Umur\`* : ${age}
✿ *\`SN\`* : ${sn}

✿ *\`Tanggal\`* : ${week}, ${date}
✿ *\`Waktu\`* : ${time}

✿ *\`Status\`* : Data berhasil disimpan`

  const thumbnail = fs.readFileSync('./media/ryo1.jpg')

  await conn.sendMessage(
    m.chat,
    {
      image: thumbnail,
      caption,
      footer: 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ',
      optionText: 'Pilih Menu',
      optionTitle: 'Daftar',
      nativeFlow: [
        {
          text: 'Menu',
          sections: [
            {
              title: 'Main',
              rows: [
                {
                  title: 'Menu Utama',
                  id: '.menu'
                }
              ]
            }
          ]
        },
        {
          text: 'Copy SN',
          copy: sn
        }
      ]
    },
    { quoted: m }
  )
}

handler.help = ['daftar']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler