import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`Example: ${usedPrefix}${command} 62`)

  try {
    let url = API('lol', '/api/callingcode/' + text)
    let res = await fetch(url)
    let json = await res.json()

    if (json.status !== 200) throw 'API Error'

    let d = json.result

    let msg = `
📞 *Calling Code Information*

🌍 Negara      : ${d.name}
📱 Kode Telp   : +${d.callingCodes.join(', ')}
🏙️ Ibu Kota    : ${d.capital}
🗺️ Region      : ${d.region}
🔖 ISO2        : ${d.alpha2Code}
🔖 ISO3        : ${d.alpha3Code}
🌐 Domain      : ${d.topLevelDomain.join(', ')}
`.trim()

    m.reply(msg)

  } catch (e) {
    m.reply('Kode tidak ditemukan atau API sedang error')
  }
}

handler.help = ['callingcode <kode>']
handler.tags = ['info']
handler.command = /^callingcode$/i
handler.limit = true

export default handler