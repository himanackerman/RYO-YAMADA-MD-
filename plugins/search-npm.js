import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return m.reply(
      `❌ Masukkan nama package\n\nContoh:\n${usedPrefix}npmsearch baileys`
    )
  }

  try {
    const { data } = await axios.get(
      `https://manzxy.my.id/search/npm?q=${encodeURIComponent(text)}`
    )

    if (!data?.status || !data.result?.length) {
      return m.reply('❌ Package tidak ditemukan')
    }

    const list = data.result.slice(0, 8) // ambil 8 teratas

    let caption = `📦 *NPM SEARCH*\n`
    caption += `🔍 Query: *${text}*\n`
    caption += `📊 Total: *${data.result.length} package*\n\n`

    for (let i = 0; i < list.length; i++) {
      const v = list[i]
      caption +=
`*${i + 1}. ${v.title}*
👤 Author   : ${v.author || '-'}
⬇️ Download : ${v.download.weekly} / minggu
📅 Update   : ${new Date(v.update).toLocaleDateString()}
🌐 NPM      : ${v.links?.npm || '-'}

`
    }

    await conn.sendMessage(
      m.chat,
      {
        text: caption.trim(),
        contextInfo: {
          externalAdReply: {
            title: 'NPM Package Search',
            body: 'Powered by manzxy.my.id',
            thumbnailUrl: 'https://nodejs.org/static/images/logo.svg',
            sourceUrl: 'https://www.npmjs.com',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil data NPM')
  }
}

handler.help = ['npmsearch <query>']
handler.tags = ['search']
handler.command = /^npm(search)?$/i

export default handler