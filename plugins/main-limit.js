import fs from 'fs'

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (user.limit == undefined) user.limit = 10

  let teks = `💳 *Limit Kamu:* ${user.limit}`

  await conn.sendMessage(m.chat, {
    text: teks,
    contextInfo: {
      externalAdReply: {
        title: 'Limit Kamu',
        body: 'Informasi limit terbaru',
        mediaType: 1,
        thumbnail: fs.readFileSync('./media/thumbnail.jpg'),
        renderLargerThumbnail: true,
       // sourceUrl: 'https://youtube.com/@hilmanxd'
      }
    }
  }, { quoted: m })
}

handler.help = ['limit']
handler.tags = ['info']
handler.command = /^limit$/i
handler.limit = false

export default handler