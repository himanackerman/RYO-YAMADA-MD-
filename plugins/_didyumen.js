import didyoumean from 'didyoumean'
import similarity from 'similarity'
import fetch from 'node-fetch'

let handler = m => m

handler.before = async function (m, { match, usedPrefix }) {
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

      // Ambil gambar thumbnail baru
      let thumb = await fetch("https://img1.pixhost.to/images/10942/671623115_shiroko-bot.jpg")
      let thumbnail = Buffer.from(await thumb.arrayBuffer())

      let text = `❓ *Apakah maksudmu command ini?*\n\n` +
                 `✨ ᴄᴏᴍᴍᴀɴᴅ: *${usedPrefix + mean}*\n` +
                 `📊 ᴋᴇᴍɪʀɪᴘᴀɴ: *${similarityPercentage}%*`

      await this.sendMessage(m.chat, {
        text,
        footer: '🍭 RYO YAMADA - MD',
        headerType: 1,
        contextInfo: {
          externalAdReply: {
            title: "Ryo Yamada Device",
            body: "✨ Sistem AutoCorrect Command",
            mediaType: 1,
            renderLargerThumbnail: false,
            thumbnail, // Foto baru
            // sourceUrl: ""
          }
        }
      }, { quoted: m })
    }
  }
}

export default handler