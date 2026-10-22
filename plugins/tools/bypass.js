import scraper from '@zenaveline/scraper'

let handler = async (m, { text }) => {
  if (!text) throw `Contoh:\n.bypass https://sfl.gl/ntCx0RF`

  try {
    const result = await scraper.bypasstools(text)

    await m.reply(
`*\`Bypass Shortlink\`*

*• Input :* ${text}
*• Result :* ${result}`
    )
  } catch (e) {
    console.error(e)
    throw 'Gagal melakukan bypass shortlink.'
  }
}

handler.help = ['bypass <url>']
handler.tags = ['tools']
handler.command = ['bypass']

export default handler