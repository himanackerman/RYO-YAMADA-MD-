import { sendAmLink } from '../../lib/scrape/alightmotion.js'

let handler = async (m, { text, usedPrefix, command }) => {
  const email = (text || '').trim()

  if (!email || !email.includes('@')) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik:\n` +
      `*${usedPrefix + command} email*\n\n` +
      `*Contoh:* ${usedPrefix + command} user@example.com`
    )
  }

  await m.react('⏳')

  try {
    const res = await sendAmLink(email)

    const textSuccess = `*\`Alight Motion Link Sent\`*

✿ Email : ${email}
✿ Status : Sukses terkirim
✿ Message : ${res?.message || 'Cek kotak masuk/spam email kamu untuk tautan verifikasi.'}`

    await m.reply(textSuccess)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('Error amsend:', e)
    throw e.response?.data?.message || e.message || 'Gagal mengirim link Alight Motion.'
  }
}

handler.help = ['amsend <email>']
handler.tags = ['tools']
handler.command = /^(amsend)$/i
handler.limit = true

export default handler
