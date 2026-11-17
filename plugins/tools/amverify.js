import { verifyAmAccount } from '../../lib/scrape/alightmotion.js'

let handler = async (m, { text, usedPrefix, command }) => {
  const parts = (text || '').trim().split(/\s+/)
  const email = parts[0]
  const link = parts.slice(1).join(' ')

  if (!email || !link || !email.includes('@') || !link.startsWith('http')) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik:\n` +
      `*${usedPrefix + command} email link_verifikasi*\n\n` +
      `*Contoh:* ${usedPrefix + command} user@example.com https://alightcreative.com/signin?oobCode=xxxx`
    )
  }

  await m.react('⏳')

  try {
    const res = await verifyAmAccount(email, link)

    const textSuccess = `*\`Alight Motion Verified\`*

✿ Email : ${email}
✿ Order ID : ${res?.orderId || '-'}
✿ UID : ${res?.uid || '-'}
✿ Status : Berhasil diverifikasi`

    await m.reply(textSuccess)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    console.error('Error amverify:', e)
    throw e.response?.data?.message || e.message || 'Gagal memverifikasi akun Alight Motion.'
  }
}

handler.help = ['amverify <email> <link>']
handler.tags = ['tools']
handler.command = /^(amverify)$/i
handler.limit = true

export default handler
