/*
Jangan Hapus Wm Bang 

*Yts Button  Plugins Esm*

Kayak Gini aj Di jual Fefek

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

Tak ada 
*/

import yts from 'yt-search'

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Cari apa?'
  await conn.reply(m.chat, global.wait, m)

  let results = await yts(text)
  let videos = results.all.filter(v => v.type === 'video') 
  
  if (videos.length === 0) throw 'Video tidak ditemukan!'

  let index = 0 
  let video = videos[index] 

  let bella = `
° *${video.title}*\n
↳ *Link :* ${video.url}\n
↳ *Duration :* ${video.timestamp}\n
↳ *Uploaded :* ${video.ago}\n
↳ *Views :* ${video.views}`

  await conn.sendMessage(
    m.chat,
    {
      image: { url: video.thumbnail },
      caption: bella,
      title: "YouTube Search By Takashi G4",
      subtitle: "YouTube Search",
      footer: "Takashi - 2025",
      media: true,
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Download Video",
            id: `.ytmp4 ${video.url}`
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Download Audio",
            id: `.play ${video.url}`
          })
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Cari Lagi",
            id: `.yts ${text} ${index + 1}`
          })
        }
      ]
    },
    { quoted: m }
  )
}

handler.help = ['yts <query>']
handler.tags = ['tools']
handler.command = /^yts(earch)?(\s\d+)?$/i
handler.limit = true;

export default handler