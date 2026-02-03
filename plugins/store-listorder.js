let handler = async (m) => {
  let orders = global.db.data.store?.orders || []
  if (!orders.length) return m.reply('📭 Belum ada order masuk.')

  let teks = '*📋 DAFTAR ORDER MASUK*\n\n'

  orders.forEach((v, i) => {
    teks += `#${i + 1}\n`
    teks += `• Barang: ${v.barang}\n`
    teks += `• Dari  : @${v.from.split('@')[0]}\n`
    teks += `• Waktu : ${v.time}\n\n`
  })

  m.reply(teks, null, { mentions: orders.map(v => v.from) })
}

handler.help = ['listorder']
handler.tags = ['store']
handler.command = /^listorder$/i
handler.owner = true

export default handler