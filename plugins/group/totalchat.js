import fs from 'fs'
import path from 'path'

const chatDbPath = './lib/chat.json'

if (!fs.existsSync('./lib')) {
fs.mkdirSync('./lib')
}

if (!fs.existsSync(chatDbPath)) {
fs.writeFileSync(chatDbPath, JSON.stringify({}))
}

const loadChatData = () => {
try {
return JSON.parse(fs.readFileSync(chatDbPath))
} catch {
return {}
}
}

const saveChatData = (data) => {
fs.writeFileSync(chatDbPath, JSON.stringify(data, null, 2))
}

const getDayName = (date) => {
const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
return days[date.getDay()]
}

const getFormattedDate = (date) => {
const d = String(date.getDate()).padStart(2,'0')
const m = String(date.getMonth()+1).padStart(2,'0')
const y = date.getFullYear()
return `${d}/${m}/${y}`
}

let handler = async (m, { conn }) => {

let chatData = loadChatData()
const messages = conn.chats[m.chat]?.messages || {}
const participants = (await conn.groupMetadata(m.chat)).participants
const participantCounts = chatData[m.chat] || {}

Object.values(messages).forEach(({ key }) => {
const sender = key.participant || key.remoteJid
participantCounts[sender] = (participantCounts[sender] || 0) + 1
})

participants.forEach(({ id }) => {
if (!participantCounts[id]) participantCounts[id] = 0
})

chatData[m.chat] = participantCounts
saveChatData(chatData)

const sortedData = Object.entries(participantCounts).sort((a,b)=>b[1]-a[1]).slice(0,10)

const medals = ['🥇','🥈','🥉']

const pesan = sortedData.map(([jid,total],i)=>{
let nomor = jid.replace(/(\d+)@.+/,'@$1')
let rank = medals[i] || `${i+1}.`
return `┃ ${rank} ${nomor} — ${total} pesan`
}).join('\n')

let teks =
`╭━━━〔 📊 TOTAL CHAT 〕━━━
${pesan}
╰━━━━━━━━━━━━━━`

await m.reply(
teks,
null,
{
contextInfo:{
mentionedJid: sortedData.map(([jid]) => jid)
}
}
)

}

handler.help = ['totalchat']
handler.tags = ['group']
handler.command = /^(totalchat)$/i
handler.group = true

export default handler