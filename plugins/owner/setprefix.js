const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&')

let handler = async (m, { text }) => {
  if (!text) throw `Contoh penggunaan:
.setprefix .
.setprefix !
.setprefix . / #
.setprefix noprefix

Gunakan spasi untuk multi prefix`

  const clean = text.toLowerCase().trim()

  if (['noprefix', 'nonprefix', 'none'].includes(clean)) {
    global.noPrefix = true
    global.prefix = /^/
    return m.reply('✅ Mode *no-prefix* aktif. Command bisa dipanggil tanpa simbol apapun.')
  }

  const prefixes = [...new Set(text.split(/\s+/).map(p => p.trim()).filter(Boolean))]
  if (!prefixes.length) throw 'Prefix tidak valid.'

  global.noPrefix = false
  global.prefix = new RegExp('^(?:' + prefixes.map(escapeRe).join('|') + ')')

  await m.reply(`✅ Prefix berhasil diubah menjadi: *${prefixes.join(' , ')}*`)
}

handler.tags = ['owner']
handler.help = ['setprefix']
handler.command = /^(setprefix|setpref)$/i
handler.rowner = true

export default handler