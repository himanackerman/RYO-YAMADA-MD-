/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, { conn, participants }) => {
let user = participants.map(x => x.id)
let gc = await conn.groupMetadata(m.chat)
for (let a of user) {
if (a !== conn.user.jid && a !== gc.owner && a !== nomerown + '@s.whatsapp.net') {
conn.groupParticipantsUpdate(m.chat, [a], "remove")
}
}
}
handler.command = ['kickall']
handler.tags = ['group']
handler.help = ['kickall']
handler.owner = true 
export default handler