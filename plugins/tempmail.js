/* 
Fitur : Tempmail 
Type : Plugin ESM 
Source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
Source Scrape : https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/
*/
import axios from 'axios'

const tempail = {
  api: {
    base: 'https://tempail.top/api',
    endpoints: {
      createEmail: '/email/create/ApiTempail',
      getMessages: (emailToken) => `/messages/${emailToken}/ApiTempail`,
      getMessage: (messageId) => `/message/${messageId}/ApiTempail`
    }
  },
  headers: { 'user-agent': 'Postify/1.0.0' },
  deletedInTimestamp: null,

  createEmail: async () => {
    try {
      const res = await axios.post(
        `${tempail.api.base}${tempail.api.endpoints.createEmail}`,
        null,
        { headers: tempail.headers }
      )
      if (res.data.status !== 'success') return { success: false, code: 500, result: { error: 'Gagal bikin email temp nya bree..' } }

      const { email, email_token: emailToken, deleted_in: deletedIn } = res.data.data
      tempail.deletedInTimestamp = new Date(deletedIn).getTime()

      return { success: true, code: 200, email, emailToken, deletedIn }
    } catch (e) {
      return { success: false, code: e.response?.status || 500, result: { error: e.message } }
    }
  },

  _isTempMailDeleted: () => {
    if (!tempail.deletedInTimestamp) return false
    return Date.now() > tempail.deletedInTimestamp
  },

  getMessages: async (emailToken) => {
    if (!emailToken || typeof emailToken !== 'string' || !emailToken.trim())
      return { success: false, code: 400, result: { error: 'Email token kagak boleh kosong yak bree, harus diisi.. 🗿' } }

    if (tempail._isTempMailDeleted())
      return { success: false, code: 410, result: { error: 'Email Tempnya udah expired bree..' } }

    try {
      const url = tempail.api.endpoints.getMessages(emailToken)
      const res = await axios.get(`${tempail.api.base}${url}`, { headers: tempail.headers })

      if (res.data.status !== 'success') return { success: false, code: 500, result: { error: 'Gagal ambil list pesan bree..' } }

      const { mailbox, messages } = res.data.data
      return { success: true, code: 200, mailbox, messages }
    } catch (e) {
      return { success: false, code: e.response?.status || 500, result: { error: e.message } }
    }
  },

  getMessage: async (messageId) => {
    if (!messageId || typeof messageId !== 'string' || !messageId.trim())
      return { success: false, code: 400, result: { error: 'Message ID nya harus diisi bree, kagak kosong yak.. 🗿' } }

    if (tempail._isTempMailDeleted())
      return { success: false, code: 410, result: { error: 'Email Tempnya udah expired bree..' } }

    try {
      const url = tempail.api.endpoints.getMessage(messageId)
      const res = await axios.get(`${tempail.api.base}${url}`, { headers: tempail.headers })

      if (res.data.status !== 'success') return { success: false, code: 500, result: { error: 'Gagal ambil isi pesan bree..' } }

      const [msg] = res.data.data
      return {
        success: true,
        code: 200,
        message: {
          subject: msg.subject,
          isSeen: msg.is_seen,
          from: msg.from,
          fromEmail: msg.from_email,
          receivedAt: msg.receivedAt,
          id: msg.id,
          attachments: msg.attachments,
          content: msg.content
        }
      }
    } catch (e) {
      return { success: false, code: e.response?.status || 500, result: { error: e.message } }
    }
  }
}

let handler = async (m, { command, args, text, usedPrefix }) => {
  switch (command) {
    case 'tempmail':
      {
        const res = await tempail.createEmail()
        if (!res.success) return m.reply(res.result.error)

        m.reply(`📫 *Email Sementara berhasil dibuat!*
📧 Email: ${res.email}
🔐 Token: ${res.emailToken}
🕐 Expired: ${res.deletedIn}

Gunakan token ini untuk cek inbox:
*${usedPrefix}cekmail ${res.emailToken}*`)
      }
      break

    case 'cekmail':
      {
        const token = text.trim()
        if (!token) return m.reply('Contoh: .cekmail <email_token>')

        const res = await tempail.getMessages(token)
        if (!res.success) return m.reply(res.result.error)

        if (res.messages.length == 0) return m.reply('📭 Belum ada pesan yang masuk.')

        let out = `📥 *Daftar Pesan Masuk*\n📫 Email: ${res.mailbox}\n\n`
        out += res.messages.map((v, i) => `🔹 *${i + 1}*. ${v.subject || '(Tanpa Subjek)'}\n📩 ID: ${v.id}`).join('\n\n')
        m.reply(out + `\n\nGunakan *${usedPrefix}pesanmail <id>* untuk baca isi pesannya.`)
      }
      break

    case 'pesanmail':
      {
        const id = text.trim()
        if (!id) return m.reply('Contoh: .pesanmail <message_id>')

        const res = await tempail.getMessage(id)
        if (!res.success) return m.reply(res.result.error)

        const msg = res.message
        m.reply(`📨 *Isi Pesan*
📌 Subjek: ${msg.subject}
👤 Dari: ${msg.from} <${msg.fromEmail}>
🕐 Diterima: ${msg.receivedAt}
🆔 ID: ${msg.id}

📬 Pesan:
${msg.content ? msg.content.replace(/<[^>]*>/g, '') : '(Tidak ada isi)'}`)
      }
      break
  }
}

handler.help = ['tempmail', 'cekmail <token>', 'pesanmail <id>']
handler.tags = ['tools']
handler.command = /^tempmail|cekmail|pesanmail$/i
handler.premium = true

export default handler