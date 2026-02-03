let handler = async (m, { conn, command }) => {
  m.reply('✨ Mengirim audio...')

  let audio = `https://raw.githubusercontent.com/aisyah-rest/mangkane/main/Mangkanenya/${command}.mp3`

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: audio },
      mimetype: 'audio/mpeg'
    },
    { quoted: m }
  )
}

handler.help = Array.from({ length: 30 }, (_, i) => `mangkane${i + 25}`)
handler.tags = ['sound']
handler.command = /^mangkane(2[5-9]|3[0-9]|4[0-9]|5[0-4])$/i
handler.owner = false
handler.limit = false

export default handler