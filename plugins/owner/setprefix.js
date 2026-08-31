let handler = async (m, { text }) => {

  if (!text) throw `Contoh penggunaan:
.setprefix .
.setprefix !
.setprefix . / #
.setprefix noprefix

Gunakan spasi untuk multi prefix`

  let clean = text.toLowerCase().trim()

  if (clean === 'noprefix' || clean === 'nonprefix' || clean === 'none') {
    global.prefix = /^/
    return m.reply('✅ Mode *no-prefix* aktif. Command bisa dipanggil tanpa simbol apapun.')
  }

  let prefixes = text.split(' ').map(p => p.trim()).filter(p => p)

  global.prefix = new RegExp(
    '^(' + prefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')'
  )

  await m.reply(`✅ Prefix berhasil diubah menjadi: *${prefixes.join(' , ')}*`)
}

handler.tags = ['owner']
handler.help = ['setprefix']
handler.command = /^(setprefix|setpref)$/i
handler.rowner = true

export default handler