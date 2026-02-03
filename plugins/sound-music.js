import axios from 'axios'

const MUSIC_LIST = []
for (let i = 1; i <= 65; i++) {
  MUSIC_LIST.push(`music${i}`)
}

let handler = async (m, { conn, command }) => {
  const musicNum = command.replace('music', '')
  const num = parseInt(musicNum)

  if (isNaN(num) || num < 1 || num > 65) {
    return m.reply(
      `🎧 *SOUND COLLECTION*\n\n` +
      `Tersedia:\n.music1 sampai .music65`
    )
  }

  try {
    const musicUrl = `https://github.com/Rez4-3yz/Music-rd/raw/master/music/music${num}.mp3`

    const res = await axios.get(musicUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    await conn.sendMessage(
      m.chat,
      {
        audio: Buffer.from(res.data),
        mimetype: 'audio/mpeg',
        ptt: false
      },
      { quoted: m }
    )
  } catch (err) {
    m.reply(
      `❌ *ERROR*\n\n` +
      `Sound tidak ditemukan atau gagal diambil.`
    )
  }
}

handler.help = MUSIC_LIST
handler.tags = ['sound']
handler.command = /^music(1|[1-5][0-9]|6[0-5])$/i
handler.limit = false

export default handler