let handler = async (m, { conn }) => {
  let text = `
 *SUPPORT BOT RYO YAMADA MD* 🤍

Jika bot ini bermanfaat untukmu,
kamu bisa memberikan dukungan lewat donasi ✨

https://saweria.co/Hilmanytta
`

  await conn.sendMessage(m.chat, {
  image: { url: 'https://files.catbox.moe/0pdxsl.jpg' },
  caption: text
}, { quoted: m })
}
handler.help = ['donasi']
handler.tags = ['info']
handler.command = /^donasi$/i

export default handler