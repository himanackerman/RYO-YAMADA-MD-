let handler = async (m, { conn, text }) => {
  if (!text) throw `Contoh penggunaan:

Otomatis:
.iqc2 Halo hilman 

Manual:
.iqc2 Halo hilman|22:11|22:20`

  let [msg, chatTime, statusBarTime] = text.split('|')

  let now = new Date()
  let autoTime = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  chatTime = chatTime ? chatTime.trim() : autoTime
  statusBarTime = statusBarTime ? statusBarTime.trim() : autoTime

  let url = `https://api.deline.web.id/maker/iqc?text=${encodeURIComponent(msg.trim())}&chatTime=${encodeURIComponent(chatTime)}&statusBarTime=${encodeURIComponent(statusBarTime)}`

  await conn.sendFile(m.chat, url, 'iqc.jpg', '', m)
}

handler.help = ['iqc2']
handler.tags = ['maker']
handler.command = /^iqc2$/i
handler.limit = true

export default handler