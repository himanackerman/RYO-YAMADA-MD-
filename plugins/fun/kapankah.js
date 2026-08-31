let handler = async (m, { conn, command, text }) => {
  conn.reply(m.chat, `
*Pertanyaan:* ${command} ${text}
*Jawaban:* ${pickRandom(['1','2','3','4','5','6','7','8','9','10'])} ${pickRandom(['detik','jam','menit','hari','bulan','tahun','abad','minggu','dekade'])} lagi...
`.trim(), m, m.mentionedJid ? {
    contextInfo: {
      mentionedJid: m.mentionedJid
    }
  } : {})
}
handler.help = ['kapankah <pertanyaan>']
handler.tags = ['fun']
handler.command = /^kapankah$/i
handler.owner = false

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}