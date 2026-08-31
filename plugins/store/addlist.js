let handler = async (m, { text, command, usedPrefix }) => {
  if (!m.isGroup) throw 'Fitur ini hanya untuk grup!'

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  chat.listmsg = chat.listmsg || {}

  if (command === 'addlist') {
    if (!m.quoted) throw 'Reply pesan yang ingin disimpan'
    if (!text) throw `Contoh:\n${usedPrefix}addlist tes`

    let key = text.trim().toLowerCase()

    chat.listmsg[key] = m.quoted.fakeObj || m.quoted

    return m.reply(`✅ Berhasil menambahkan list *${key}*`)
  }

  if (command === 'list') {
    let keys = Object.keys(chat.listmsg)

    if (!keys.length) throw 'List masih kosong'

    let teks = '📋 *LIST MESSAGE*\n\n'
    teks += keys.map((v, i) => `${i + 1}. ${v}`).join('\n')

    return m.reply(teks)
  }

  if (command === 'dellist') {
    if (!text) throw `Contoh:\n${usedPrefix}dellist tes`

    let key = text.trim().toLowerCase()

    if (!chat.listmsg[key]) throw 'List tidak ditemukan'

    delete chat.listmsg[key]

    return m.reply(`🗑️ Berhasil menghapus list *${key}*`)
  }
}

handler.before = async function (m) {
  if (!m.isGroup) return
  if (!m.text) return

  let chat = global.db.data.chats[m.chat]
  if (!chat?.listmsg) return

  let key = m.text.trim().toLowerCase()

  if (
    key.startsWith('.') ||
    key.startsWith('#') ||
    key.startsWith('!') ||
    key.startsWith('/')
  ) return

  let data = chat.listmsg[key]
  if (!data) return

  try {
    await this.copyNForward(m.chat, data, true)
    return true
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['addlist', 'list', 'dellist']
handler.tags = ['store']
handler.command = /^(addlist|list|dellist)$/i
handler.group = true
handler.admin = true

export default handler