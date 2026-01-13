let handler = async (m, { conn, text }) => {
 if (!text) return m.reply('Example :\n.iqc Biji ayam')

 let time = new Intl.DateTimeFormat('id-ID', {
 timeZone: 'Asia/Jakarta',
 hour: '2-digit',
 minute: '2-digit',
 hour12: false
 }).format(new Date())

 await conn.sendMessage(m.chat, {
 image: {
 url: `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&batteryPercentage=${Math.floor(Math.random() * 100) + 1}&carrierName=INDOSAT&messageText=${encodeURIComponent(text.trim())}&emojiStyle=apple`
 }
 }, { quoted: m })
}

handler.help = ['iqc <pesan>']
handler.tags = ['maker']
handler.command = ['iqc']
handler.limit = true

export default handler