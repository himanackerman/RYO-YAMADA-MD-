import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
  try {
    const res = await fetch('https://api.siputzx.my.id/api/r/blue-archive')
    const buffer = await res.buffer()

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `Waifu Random Blue Archive\n\nKlik tombol di bawah untuk waifu baru`,
      footer: 'Ryo Yamada MD',

      nativeFlow: [
        {
          text: 'Next Waifu',
          id: `.${command}`
        }
      ]

    }, { quoted: m })
    
  } catch (err) {
    console.error(err)
    m.reply('Gagal memuat waifu')
  }
}

handler.help = ['bluearchive']
handler.tags = ['anime', 'random']
handler.command = /^bluearchive$/i
handler.limit = true

export default handler