let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Masukkan pertanyaan!\nContoh: .kimi apa itu bot wa')

  try {
    let res = await fetch(`https://api.zenzxz.my.id/api/ai/kimi?query=${encodeURIComponent(text)}`)
    let json = await res.json()
    let hasil = json?.data?.response || json?.response || 'Tidak ada respons dari AI.'
    m.reply(hasil)
  } catch (e) {
    m.reply('yahh error.')
  }
}

handler.help = ['kimi <pertanyaan>']
handler.tags = ['ai']
handler.command = /^kimi$/i
handler.limit = true

export default handler