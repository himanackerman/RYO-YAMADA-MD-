let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `Contoh penggunaan:\n` +
      `.music 1\n` +
      `.music 65`
    )
  }

  const num = parseInt(args[0])

  if (isNaN(num) || num < 1 || num > 65) {
    return m.reply('Masukkan nomor dari 1 sampai 65.')
  }

  const musicUrl = `https://github.com/Rez4-3yz/Music-rd/raw/master/music/music${num}.mp3`

  try {
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: musicUrl },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `music${num}.mp3`
      },
      { quoted: m }
    )
  } catch {
    m.reply('❌ Sound tidak ditemukan atau gagal diambil.')
  }
}

handler.help = ['music <1-65>']
handler.tags = ['sound']
handler.command = /^music$/i
handler.limit = false

export default handler