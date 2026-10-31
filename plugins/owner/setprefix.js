const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&')
const NOPREFIX_WORDS = ['noprefix', 'nonprefix', 'none']

let handler = async (m, { text }) => {
  if (!text) throw `Contoh penggunaan:
.setprefix .
.setprefix . !
.setprefix noprefix
.setprefix . noprefix

Pisahkan dengan spasi untuk multi prefix.
Tambahkan *noprefix* untuk mode kombinasi (command bisa dengan atau tanpa prefix).`

  const tokens = [...new Set(text.trim().split(/\s+/).filter(Boolean))]
  const withNoPrefix = tokens.some(t => NOPREFIX_WORDS.includes(t.toLowerCase()))
  const prefixes = tokens.filter(t => !NOPREFIX_WORDS.includes(t.toLowerCase()))

  if (!prefixes.length && !withNoPrefix) throw 'Prefix tidak valid.'

  if (!prefixes.length) {
    global.noPrefix = true
    global.prefix = /^/
    return m.reply('✅ Mode *no-prefix* aktif. Command bisa dipanggil tanpa simbol apapun.')
  }

  const pattern = prefixes.map(escapeRe).join('|')
  global.noPrefix = withNoPrefix
  global.prefix = new RegExp('^(?:' + pattern + (withNoPrefix ? '|' : '') + ')')

  await m.reply(
    withNoPrefix
      ? `✅ Mode kombinasi aktif.\nPrefix: *${prefixes.join(' , ')}* + *tanpa prefix*\nContoh: *${prefixes[0]}menu* dan *menu* sama-sama jalan.`
      : `✅ Prefix berhasil diubah menjadi: *${prefixes.join(' , ')}*`
  )
}

handler.tags = ['owner']
handler.help = ['setprefix']
handler.command = /^(setprefix|setpref)$/i
handler.rowner = true

export default handler
