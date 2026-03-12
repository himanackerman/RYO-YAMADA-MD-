/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, { conn }) => {
  conn.bomb = conn.bomb || {}
  let id = m.chat
  let timeout = 180000

  if (id in conn.bomb)
    return conn.reply(m.chat, '*^ sesi ini belum selesai!*', conn.bomb[id][0])

  const bom = ['💥','✅','✅','✅','✅','✅','✅','✅','✅']
    .sort(() => Math.random() - 0.5)

  const number = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']

  const grid = bom.map((v,i)=>({
    emot: v,
    number: number[i],
    pos: i+1,
    open: false
  }))

  let teks = `乂  *B O M B*\n\nKirim angka *1 - 9* untuk membuka kotak:\n\n`
  for (let i=0;i<grid.length;i+=3)
    teks += grid.slice(i,i+3).map(v=>v.open?v.emot:v.number).join('')+'\n'

  teks += `\n⏳ Timeout : ${timeout/60000} menit`
  teks += `\n💣 Jika kena bom EXP berkurang`

  let msg = await conn.reply(m.chat, teks, m)

  conn.bomb[id] = [
    msg,
    grid,
    setTimeout(()=>{
      let b = grid.find(v=>v.emot==='💥')
      if (conn.bomb[id])
        conn.reply(m.chat, `⏰ Waktu habis!\nBom di kotak ${b.pos}`, msg)
      delete conn.bomb[id]
    }, timeout),
    msg.key
  ]
}

handler.help = ['bomb']
handler.tags = ['game']
handler.command = /^bomb$/i

export default handler


export async function before(m, { conn }) {
  conn.bomb = conn.bomb || {}
  let id = m.chat
  if (!(id in conn.bomb)) return

  let body = m.text
  if (!body) return

  let isSurrender = /^((me)?nyerah|surr?ender)$/i.test(body)
  let users = global.db.data.users[m.sender]
  let reward = randomInt(100,80000)

  if (isSurrender) {
    conn.reply(m.chat,'🚩 Menyerah!',m)
    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]
    return true
  }

  if (!m.quoted || m.quoted.id !== conn.bomb[id][3].id) return
  if (isNaN(body)) return

  let pick = conn.bomb[id][1].find(v=>v.pos==Number(body))
  if (!pick) return conn.reply(m.chat,'Kirim angka 1 - 9',m)

  if (pick.open)
    return conn.reply(m.chat,`Kotak ${pick.number} sudah dibuka`,m)

  pick.open = true
  let grid = conn.bomb[id][1]

  let render = () => {
    let t = `乂  *B O M B*\n\n`
    for (let i=0;i<grid.length;i+=3)
      t += grid.slice(i,i+3).map(v=>v.open?v.emot:v.number).join('')+'\n'
    return t
  }

  if (pick.emot==='💥') {
    let teks = render()
    teks += `\n\n💥 BOM MELEDAK!\n-${formatNumber(reward)} EXP`

    users.exp = Math.max(0, users.exp - reward)

    conn.reply(m.chat, teks, m)
    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]
    return true
  }

  let safeOpen = grid.filter(v=>v.open && v.emot!=='💥').length
  if (safeOpen >= 8) {
    let teks = render()
    teks += `\n\n🎉 MENANG!\n+${formatNumber(reward)} EXP`

    users.exp += reward

    conn.reply(m.chat, teks, m)
    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]
    return true
  }

  let teks = render()
  teks += `\n\n✨ Aman!\n+${formatNumber(reward)} EXP`

  users.exp += reward

  conn.reply(m.chat, teks, m)
  return true
}

export const exp = 0

function randomInt(min,max){
  return Math.floor(Math.random()*(max-min+1))+min
}

function formatNumber(n){
  return n.toLocaleString()
}