let handler = async (m, { conn, args, usedPrefix, command }) => {

  let nomor

  if (/add|tambah|\+/.test(command)) {
    if (args.length < 2) throw `Contoh:\n${usedPrefix + command} 30 628xxxx`
    nomor = args[1].replace(/[^0-9]/g, '')
  }

  if (/del|hapus|-/.test(command)) {
    if (args.length < 1) throw `Contoh:\n${usedPrefix + command} 628xxxx`
    nomor = args[0].replace(/[^0-9]/g, '')
  }

  if (!nomor || nomor.length < 10) throw 'Nomor tidak valid'
  let who = nomor + '@s.whatsapp.net'

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      name: await conn.getName(who) || 'Unknown',
      limit: 10,
      exp: 0,
      level: 0,
      register: false,
      premium: false,
      premiumTime: 0
    }
  }

  let user = global.db.data.users[who]
  let now = Date.now()

  switch (true) {
    case /add|tambah|\+/.test(command): {
      let hari = args[0]

      if (hari.toLowerCase() === 'permanen') {
        user.premium = true
        user.premiumTime = Infinity

        let teks =
`✅ *Success*

👤 User : ${nomor}
⭐ Status : Premium Permanen
📅 Tanggal : ${new Date().toLocaleDateString()}`

        await conn.sendMessage(m.chat, { text: teks, contextInfo: {} })
        await conn.sendMessage(who, { text: teks, contextInfo: {} })
      } else {
        if (isNaN(hari)) throw `Hanya angka!`

        let ms = 86400000 * parseInt(hari)

        if (user.premiumTime && user.premiumTime > now) {
          user.premiumTime += ms
        } else {
          user.premiumTime = now + ms
        }

        user.premium = true

        let teks =
`✅ *Success*

👤 User : ${nomor}
🕒 Durasi : ${hari} Hari
📅 Berakhir : ${new Date(user.premiumTime).toLocaleDateString()}`

        await conn.sendMessage(m.chat, { text: teks, contextInfo: {} })
        await conn.sendMessage(who, { text: teks, contextInfo: {} })
      }
      break
    }

    case /del|hapus|-/.test(command): {
      user.premium = false
      user.premiumTime = 0

      let teks =
`⚠️ *Success*

👤 User : ${nomor}
Status premium dihapus pada ${new Date().toLocaleDateString()}.`

      await conn.sendMessage(m.chat, { text: teks, contextInfo: {} })
      await conn.sendMessage(who, { text: teks, contextInfo: {} })
      break
    }
  }
}

handler.help = ['addprem <hari> <nomor>', 'delprem <nomor>']
handler.tags = ['owner']
handler.command = /^(add|tambah|\+|del|hapus|-)p(rem)?$/i
handler.owner = true

export default handler