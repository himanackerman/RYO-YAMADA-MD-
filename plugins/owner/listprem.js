let handler = async (m, { conn }) => {
  try {
    let users = global.db.data.users

    let prem = Object.entries(users).filter(([jid, u]) =>
      u.premiumTime === Infinity || u.premiumTime > Date.now()
    )

    if (!prem.length) {
      return m.reply('✨ Tidak ada user premium saat ini')
    }

    let teks = `✨ LIST USER PREMIUM\n\n`

    for (let [jid, user] of prem) {
      let name = await conn.getName(jid)
      let tag = '@' + jid.split('@')[0]

      let sisa = user.premiumTime - Date.now()

      let waktu = user.premiumTime === Infinity
        ? 'Permanen'
        : sisa > 0
          ? msToDate(sisa)
          : 'Expired'

      teks += `👤 ${name}
🔗 ${tag}
🌙 ${waktu}

`
    }

    await new Button(conn)
      .setTitle('List User Premium')
      .setBody(teks.trim())
      .addButton('inapp_signup', {})
      .send(m.chat, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Terjadi kesalahan saat mengambil daftar premium.')
  }
}

handler.help = ['listprem']
handler.tags = ['owner']
handler.command = /^list(prem|premium)$/i
handler.owner = true

export default handler

function msToDate(ms) {
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms % 86400000 / 3600000)
  let m = Math.floor(ms % 3600000 / 60000)

  return `${d} Hari ${h} Jam ${m} Menit`
}