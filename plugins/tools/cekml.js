let handler = async (m, { args, usedPrefix, command }) => {
  if (args.length < 2) {
    return m.reply(`Example:
${usedPrefix + command} id zone`)
  }

  let userId = args[0]
  let zoneId = args[1]

  await m.reply('✨ wait..')

  try {
    let url = `https://api.nexray.web.id/stalker/mlbb?id=${userId}&zone=${zoneId}`
    let res = await fetch(url)
    let data = await res.json()

    if (!data.status) throw 'Data tidak ditemukan'

    let result = data.result

    let teks = ` *CEK AKUN MLBB*

👤 *Nickname:* ${result.username}
🌍 *Region:* ${result.region}

🆔 *ID:* ${result.id} (${result.zone})`

    m.reply(teks)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error')
  }
}

handler.help = ['cekml']
handler.tags = ['tools']
handler.command = /^(mlbb|cekml|mlstalk)$/i

export default handler