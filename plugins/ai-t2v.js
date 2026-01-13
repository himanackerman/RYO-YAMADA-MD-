
/*
- Name : Text To Video
- Deks : Jangan Berharap Sama Result ny
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Source Scrape : https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/232
*/
import axios from 'axios'

async function txt2video(prompt) {
  try {
    const { data: k } = await axios.post('https://soli.aritek.app/txt2videov3', {
      deviceID: Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8),
      prompt: prompt,
      used: [],
      versionCode: 51
    }, {
      headers: {
        authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
        'content-type': 'application/json; charset=utf-8',
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/4.11.0'
      }
    })
    
    const { data } = await axios.post('https://soli.aritek.app/video', {
      keys: [k.key]
    }, {
      headers: {
        authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
        'content-type': 'application/json; charset=utf-8',
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/4.11.0'
      }
    })
    
    return data.datas[0].url
  } catch (error) {
    throw new Error('No result found')
  }
}

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return m.reply('Masukkan prompt\nContoh: .t2v A pixel-art queen in her throne room')
    m.reply('Wait...')
    conn.sendMessage(m.chat, { video: { url: await txt2video(args.join(' ')) } }, { quoted: m })
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['t2v', 'texttovideo']
handler.command = ['t2v', 'texttovideo']
handler.tags = ['ai']
handler.limit = true
handler.register = true

export default handler