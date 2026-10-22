import { translate } from 'bing-translate-api'

const LANGUAGES = {
  'id': 'Indonesia',
  'en': 'Inggris',
  'ja': 'Jepang',
  'ko': 'Korea',
  'zh-Hans': 'Mandarin',
  'ar': 'Arab',
  'ms': 'Melayu',
  'th': 'Thailand',
  'vi': 'Vietnam',
  'hi': 'Hindi',
  'jv': 'Jawa',
  'su': 'Sunda',
  'es': 'Spanyol',
  'fr': 'Prancis',
  'de': 'Jerman',
  'it': 'Italia',
  'ru': 'Rusia',
  'pt': 'Portugis',
  'nl': 'Belanda',
  'tr': 'Turki',
  'fil': 'Filipina',
  'uk': 'Ukraina'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let lang
  let text

  if (args[0] && (args[0].length === 2 || LANGUAGES[args[0]])) {
    lang = args[0]
    text = args.slice(1).join(' ')
  } else {
    lang = 'id'
    text = args.join(' ')
  }

  if (!text && m.quoted && m.quoted.text) {
    text = m.quoted.text
  }

  if (!text) {
    let langList = Object.entries(LANGUAGES)
      .map(([code, name]) => `* *${code}* : ${name}`)
      .join('\n')

    return m.reply(
`*Error:* Gunakan format:
${usedPrefix + command} <kode_bahasa> <teks>
atau reply pesan yang ingin diterjemahkan.

Contoh:
*${usedPrefix + command} en Selamat pagi*
*${usedPrefix + command} id* (balas pesan)

*Kode Bahasa yang Tersedia:*
${langList}`.trim()
    )
  }

  try {
    let res = await translate(text, null, lang, false)
    
    let fromLang = res?.language?.from ? res.language.from : 'Auto'
    let resultText = res?.translation || res?.text

    if (!resultText) throw new Error('Hasil terjemahan kosong')

    let replyText = `
*Terjemahan:*

* *Dari:* ${fromLang.toUpperCase()}
* *Ke:* ${lang.toUpperCase()}
* *Hasil:* ${resultText}
`.trim()

    await m.reply(replyText)
  } catch (e) {
    console.error(e)
    m.reply(`❌ Gagal menerjemahkan teks.\n\n*Error:* ${e.message || e}`)
  }
}

handler.help = ['translate']
handler.tags = ['tools']
handler.command = /^(translate|tr)$/i

export default handler