
/*
📌 Nama Fitur: Cpanel 
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/


import fetch from 'node-fetch'
import '../config.js'

// ini biar pw nya acak, jadi biar ga mudah di hek orang :v
function generatePassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const handler = async (m, { conn, text, args, command }) => {
  if (!text) return m.reply(`Contoh:\n\n*${command} username,628xxx* atau *${command} username*`)

  let usernem, nomor
  let parts = text.split(',')
  if (parts.length > 1) {
    const [users, nom] = parts.map(s => s.trim())
    if (!users || !nom) return m.reply(`Contoh:\n\n*${command} username,628xxx*`)
    usernem = users.toLowerCase()
    nomor = nom.replace(/\D/g, '') + '@s.whatsapp.net'
  } else {
    usernem = text.toLowerCase()
    nomor = m.isGroup ? m.sender : m.chat
  }

  const onWa = await conn.onWhatsApp(nomor.split("@")[0])
  if (!onWa?.length) return m.reply("Nomor target tidak terdaftar di WhatsApp!")

  const username = usernem.toLowerCase()
  const email = `${username}@gmail.com`
  const name = username.charAt(0).toUpperCase() + username.slice(1)
  const password = generatePassword()
  const { domain, apikey } = global

  try {
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      },
      body: JSON.stringify({
        email,
        username,
        first_name: name,
        last_name: "Admin",
        root_admin: true,
        language: "en",
        password
      })
    })
    const userJson = await userRes.json()
    if (userJson.errors) return m.reply("Gagal membuat user:\n" + JSON.stringify(userJson.errors[0], null, 2))
    const user = userJson.attributes

    const teks = `
*Berikut Detail Akun Admin Panel 📦*

📡 *ID User:* ${user.id}
👤 *Username:* ${user.username}
🔐 *Password:* ${password}
📅 *Tanggal:* ${new Date().toLocaleString('id-ID')}

🌐 *Panel:* ${domain}

⚠️ *Syarat & Ketentuan:*
• Expired akun 1 bulan
• Simpan data ini sebaik mungkin
• Jangan asal hapus server!
• Ketahuan maling script, auto delete akun!
`

    await conn.sendMessage(nomor, { text: teks }, { quoted: m })
    if (nomor !== m.chat) {
      await m.reply(`Berhasil membuat akun admin dan dikirim ke *${nomor.split("@")[0]}* ✅`)
    }
  } catch (err) {
    m.reply("Terjadi kesalahan: " + err.message)
  }
}

handler.command = ['cadmin']
handler.tags = ['panel']
handler.help = ['cadmin <username>[,nomor]']
handler.owner = false
handler.premium = true

export default handler