// • Feature : Ayesoul AI
// • Source  : https://api.nekolabs.my.id
// • Plugins ESM
// • Author Hilman 
import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🧀 Contoh: ${usedPrefix + command} Apa itu bot wa`

  try {
    let res = await fetch(`https://api.nekolabs.my.id/ai/ayesoul?text=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.status) throw `❌ Gagal mendapatkan respon dari Ayesoul AI.`

    let result = json.result
    let caption = `🧠 *Ayesoul AI*\n\n${result.message}\n`

    if (result.contextSources && result.contextSources.length > 0) {
      caption += `\n📚 *Sumber Utama:*\n`
      caption += result.contextSources.map(s => `- ${s}`).join('\n')
    }

    if (result.followUpQuestions && result.followUpQuestions.length > 0) {
      caption += `\n\n💡 *Pertanyaan Lanjutan:*\n`
      caption += result.followUpQuestions.map(q => `- ${q.question}${q.link ? ` (${q.link})` : ''}`).join('\n')
    }

    await m.reply(caption)

  } catch (e) {
    console.error(e)
    throw `🍬 Terjadi kesalahan, coba lagi nanti.`
  }
}

handler.help = ['ayesoul <teks>']
handler.tags = ['ai']
handler.command = /^ayesoul$/i
handler.limit = false

export default handler