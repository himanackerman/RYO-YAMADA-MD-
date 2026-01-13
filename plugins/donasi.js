let handler = async (m, { conn }) => {
  let text = `
 *SUPPORT BOT RYO YAMADA MD* 🤍

Jika bot ini bermanfaat untukmu,
kamu bisa memberikan dukungan lewat donasi ✨

https://saweria.co/Hilmanytta
`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      externalAdReply: {
        title: 'Donasi Ryo Yamada MD',
        body: 'Terima kasih atas dukungannya 🤍',
        thumbnailUrl: 'https://files.catbox.moe/0pdxsl.jpg',
        sourceUrl: 'https://saweria.co/Hilmanytta',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['donasi']
handler.tags = ['info']
handler.command = /^donasi$/i

export default handler