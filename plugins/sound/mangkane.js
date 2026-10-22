let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply(
      `Contoh penggunaan:\n` +
      `.mangkane 1\n` +
      `.mangkane 54`
    )
  }

  const num = parseInt(args[0])

  if (isNaN(num) || num < 1 || num > 54) {
    return m.reply('Masukkan nomor dari 1 sampai 54.')
  }

  let audio

  if (num <= 24) {
    audio = `https://raw.githubusercontent.com/hyuura/Rest-Sound/main/HyuuraKane/mangkane${num}.mp3`
  } else {
    audio = `https://raw.githubusercontent.com/aisyah-rest/mangkane/main/Mangkanenya/mangkane${num}.mp3`
  }

  m.reply('✨ Mengirim audio...')

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `mangkane${num}.mp3`
    },
    { quoted: global.fkontak || m }
  )
}

handler.help = ['mangkane <1-54>']
handler.tags = ['sound']
handler.command = /^mangkane$/i
handler.limit = false

export default handler