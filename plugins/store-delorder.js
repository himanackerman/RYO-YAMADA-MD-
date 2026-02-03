let handler = async (m, { args }) => {
  let orders = global.db.data.store?.orders || []
  if (!orders.length) return m.reply('Tidak ada order.')

  let no = parseInt(args[0])
  if (!no || no < 1 || no > orders.length) {
    return m.reply('❗ Contoh: .delorder 1')
  }

  let del = orders.splice(no - 1, 1)[0]
  m.reply(`✅ Order *${del.barang}* berhasil dihapus dari antrian.`)
}

handler.help = ['delorder <no>']
handler.tags = ['store']
handler.command = /^delorder$/i
handler.owner = true

export default handler