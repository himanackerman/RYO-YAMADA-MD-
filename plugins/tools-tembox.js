import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const headers = { 'user-agent': 'NB Android/1.0.0' }

  // ==== HANDLE .copy email|token ====
  if (/^copy$/i.test(command)) {
    if (!args[0] || !args[1]) throw `Format salah!\nContoh:\n${usedPrefix}copy email nama@tempmail.lol`
    const [tipe, ...teks] = args
    const isi = teks.join(' ')
    let label = {
      email: '📋 Email disalin',
      token: '🔑 Token disalin'
    }[tipe.toLowerCase()] || '✅ Disalin'

    return m.reply(`${label}:\n${isi}`)
  }

  // ==== HANDLE .temboxcek ====
  if (/cek$/i.test(command)) {
    const token = args[0]
    if (!token) throw `Masukkan token untuk cek inbox!\n\nContoh:\n${usedPrefix + command} <token>`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    try {
      const { data } = await axios.get(`https://api.tempmail.lol/v2/inbox?token=${token}`, { headers })

      if (data.expired) throw 'Emailnya udah expired bree... Bikin lagi aja.'

      const emails = data.emails?.map((e, i) => `
📩 *Email ke-${i + 1}*
📤 Dari: ${e.from}
📥 Subjek: ${e.subject}
🕒 Waktu: ${e.createdAt}
📃 Pesan:
${e.body}
`.trim()).join('\n\n') || '📭 Belum ada email masuk.'

      return m.reply(`✅ *Inbox ${token}*\n\n${emails}`)
    } catch (e) {
      throw `Gagal cek inbox:\n\n${e?.response?.data?.error || e.message}`
    }
  }

  // ==== HANDLE .tembox ====
  const prefix = args[0] || ''
  const payload = { domain: null, captcha: null }
  if (prefix) payload.prefix = prefix

  try {
    const { data } = await axios.post('https://api.tempmail.lol/v2/inbox/create', payload, { headers })

    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000)

    const message = `✅ *Temporary Mail berhasil dibuat!*\n\n📧 Email: ${data.address}\n🔑 Token: ${data.token}\n⏳ Exp: ${expiresAt.toLocaleString()}\n\nKetik *.temboxcek ${data.token}* untuk cek inbox!`

    await conn.sendMessage(m.chat, {
      text: message,
      footer: 'Klik tombol untuk salin ke chat',
      buttons: [
        { buttonId: `.copy email ${data.address}`, buttonText: { displayText: '📋 Salin Email' }, type: 1 },
        { buttonId: `.copy token ${data.token}`, buttonText: { displayText: '🔑 Salin Token' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  } catch (e) {
    throw `Gagal membuat email:\n\n${e?.response?.data?.error || e.message}`
  }
}

handler.help = ['tembox [prefix]', 'temboxcek <token>', 'copy email/token <isi>']
handler.tags = ['tools']
handler.command = /^tembox(cek)?$|^copy$/i
handler.limit = true

export default handler