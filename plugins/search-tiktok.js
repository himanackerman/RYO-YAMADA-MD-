/**
  • Fitur   : TikTok Search (Send Video + Button)
  • Type    : Plugin ESM
  • API     : https://api-faa.my.id
  • Author : Hilman 
**/

let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    await m.react('✨')

    if (!text) {
      return m.reply(
        `Contoh:\n` +
        `${usedPrefix + command} ryo yamada edit\n` +
        `${usedPrefix + command} anime edit`
      )
    }

    let query = text.trim()
    if (!query) return m.reply('❌ Kata kunci kosong.')

    let res = await (
      await fetch(
        `https://api-faa.my.id/faa/tiktok-search?q=${encodeURIComponent(query)}`
      )
    ).json()

    if (!res?.status || !Array.isArray(res.result) || res.result.length === 0) {
      return m.reply(`❌ Tidak ada hasil untuk "${query}"`)
    }

    let pick = res.result[Math.floor(Math.random() * res.result.length)]

    await conn.sendMessage(
      m.chat,
      {
        video: { url: pick.url_nowm },
        caption:
          `# *TIKTOK SEARCH*\n\n` +
          `> *Query*: ${query}\n` +
          `> *Judul*: ${pick.title || '-'}\n` +
          `> *Uploader*: ${pick.author?.nickname || pick.author?.username || '-'}\n` +
          `> *Durasi*: ${pick.duration}\n` +
          `> *Views*: ${pick.stats?.views || '-'}`,
        buttons: [
          {
            buttonId: `${usedPrefix}${command} ${query}`,
            buttonText: { displayText: '✨ Cari Lagi' },
            type: 1
          }
        ],
        headerType: 4
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

handler.help = ['ttsearch', 'tiktoksearch']
handler.tags = ['search']
handler.command = /^(ttsearch|tiktoksearch)$/i
handler.limit = true

export default handler