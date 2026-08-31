let handler = async (m, { conn }) => {
  const conns = global.jadibotConns || new Map()

  if (conns.size === 0) {
    return m.reply('Belum ada sub-bot yang aktif.')
  }

  let i = 1
  let text = `📡 *Daftar Jadibot Aktif (${conns.size})*\n\n`

  for (const [number, subConn] of conns) {
    const isConnected = !!subConn?.user?.id
    const name = subConn?.user?.name || '-'
    text += `${i}. *${number}*\n`
    text += `   Status : ${isConnected ? '✅ Connected' : '⏳ Connecting...'}\n`
    text += `   Nama   : ${name}\n\n`
    i++
  }

  m.reply(text.trim())
}

handler.help = ['listbot']
handler.tags = ['owner']
handler.command = /^listbot$/i
handler.owner = true

export default handler