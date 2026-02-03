let handler = async (m, { conn, command }) => {
  m.reply('✨ Mengirim audio...')

  let audioUrl = `https://raw.githubusercontent.com/Aisyah-Aldi/Sound/main/${command}.mp3`

  await conn.sendFile(
    m.chat,
    audioUrl,
    `${command}.mp3`,
    null,
    m,
    false,
    {
      type: 'audioMessage',
      ptt: true,
      seconds: 0
    }
  )
}

handler.help = Array.from({ length: 119 }, (_, i) => `sound${i + 1}`)
handler.tags = ['sound']
handler.command = /^sound\d{1,3}$/i
handler.limit = false

export default handler