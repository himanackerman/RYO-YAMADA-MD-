import didyoumean from 'didyoumean'
import similarity from 'similarity'
import fs from 'fs'

let handler = m => m

handler.before = async function (m, { match, usedPrefix }) {
  if (!global.autocorrect) return
  if (!m.text) return

  if ((usedPrefix = (match[0] || '')[0])) {
    let noPrefix = m.text.slice(1).trim()
    if (!noPrefix) return

    let alias = Object.values(global.plugins)
      .filter(v => v.help && !v.disabled)
      .flatMap(v => v.help)

    if (!alias.length) return

    let mean = didyoumean(noPrefix, alias)
    if (!mean) return

    let sim = similarity(noPrefix.toLowerCase(), mean.toLowerCase())
    let similarityPercentage = Math.round(sim * 100)

    if (mean && noPrefix.toLowerCase() !== mean.toLowerCase()) {
      let text = `
❏ Apakah maksudmu command ini?

❏ Command   : ${usedPrefix + mean}
❏ Kemiripan : ${similarityPercentage}%
`.trim()

      const urlA = 'https://github.com/himanackerman'
      const invisible = '\u200B'.repeat(400)

      await this.sendMessage(
        m.chat,
        {
          text: `${urlA}${invisible}\n${text}`,
          linkPreview: {
            'matched-text': urlA,
            title: 'Ryo Yamada MD',
            description: 'WhatsApp Multi Device Bot',
            previewType: 0,
            jpegThumbnail: fs.readFileSync('./media/thumbnail.jpg')
          }
        },
        { quoted: m }
      )
    }
  }
}

export default handler