let handler = async (m) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  const animals = [
    'banteng','harimau','gajah','kambing','panda','buaya',
    'kerbau','sapi','monyet','ayam','babi','babihutan'
  ]

  let isi = animals
    .map(v => {
      user[v] = user[v] || 0
      return user[v] > 0
        ? `• ${global.rpg.emoticon(v)} ${v}: ${user[v]}`
        : null
    })
    .filter(Boolean)
    .join('\n')

  let caption = isi
    ? `📮 *KANDANG KAMU*\n\n${isi}`
    : '📮 Kandang kamu masih kosong!'

  m.reply(caption)
}

handler.help = ['kandang']
handler.tags = ['rpg']
handler.command = /^(kandang)$/i
handler.register = true
handler.group = true
handler.rpg = true

export default handler