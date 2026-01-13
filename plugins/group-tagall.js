// Code By Xnuvers007
// https://github.com/Xnuvers007
/////////////////////////////////

let handler = async (m, { conn, text, participants }) => {
    let teks = `◇───── Tag All ─────◇
乂 *Pesan : ${text ? text : 'kosong'}*\n\n`
				for (let mem of participants) {
					teks += `• @${mem.id.split('@')[0]}\n`
				}
				conn.sendMessage(m.chat, {
					text: teks,
					mentions: participants.map(a => a.id)
				}, {
					quoted: m
				})
  }
  
  handler.help = ['tagall']
  handler.tags = ['group']
  handler.command = ['tagall']
  handler.admin = true
  handler.group = true
  
  export default handler