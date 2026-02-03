let handler = async (m, { conn, command }) => {
  m.reply('✨ Mengirim audio...')

  let audio = `https://raw.githubusercontent.com/hyuura/Rest-Sound/main/HyuuraKane/${command}.mp3`

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      ptt: true
    },
    { quoted: global.fkontak || m }
  )
}

handler.help = Array.from({ length: 24 }, (_, i) => `mangkane${i + 1}`)
handler.tags = ['sound']
handler.command = /^mangkane([1-9]|1[0-9]|2[0-4])$/i
handler.owner = false
handler.limit = false

export default handler