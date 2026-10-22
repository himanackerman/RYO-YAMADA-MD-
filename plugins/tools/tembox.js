import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const headers = { 'user-agent': 'NB Android/1.0.0' }

  if (/^copy$/i.test(command)) {
    if (!args[0] || !args[1]) throw `Format salah!\nContoh:\n${usedPrefix}copy email nama@tempmail.lol`
    const [tipe, ...teks] = args
    const isi = teks.join(' ')
    return m.reply(`Disalin:\n${isi}`)
  }

  if (/cek$/i.test(command)) {
    const token = args[0]
    if (!token) throw `Masukkan token!\n\nContoh:\n${usedPrefix + command} <token>`

    try {
      const { data } = await axios.get(`https://api.tempmail.lol/v2/inbox?token=${token}`, { headers })

      if (data.expired) throw 'Email sudah expired'

      const emails = data.emails?.map((e, i) => `
Email ${i + 1}
Dari: ${e.from}
Subjek: ${e.subject}
Waktu: ${e.createdAt}

${e.body}
`.trim()).join('\n\n') || 'Belum ada email masuk'

      return m.reply(`Inbox ${token}\n\n${emails}`)
    } catch (e) {
      throw `Gagal cek inbox:\n${e?.response?.data?.error || e.message}`
    }
  }

  const prefix = args[0] || ''
  const payload = { domain: null, captcha: null }
  if (prefix) payload.prefix = prefix

  try {
    const { data } = await axios.post('https://api.tempmail.lol/v2/inbox/create', payload, { headers })

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    const message = `Temporary Mail

Email : ${data.address}
Token : ${data.token}
Exp   : ${expiresAt.toLocaleString()}

Gunakan:
${usedPrefix}temboxcek ${data.token}`

    await conn.sendMessage(m.chat, {
      text: message,
      footer: 'Ryo Yamada MD',

      nativeFlow: [
        {
          text: 'Copy Email',
          copy: data.address
        },
        {
          text: 'Copy Token',
          copy: data.token
        },
        {
          text: 'Cek Inbox',
          id: `${usedPrefix}temboxcek ${data.token}`
        }
      ]

    }, { quoted: m })

  } catch (e) {
    throw `Gagal membuat email:\n${e?.response?.data?.error || e.message}`
  }
}

handler.help = ['tembox [prefix]', 'temboxcek <token>', 'copy email/token <isi>']
handler.tags = ['tools']
handler.command = /^tembox(cek)?$|^copy$/i
handler.limit = true

export default handler