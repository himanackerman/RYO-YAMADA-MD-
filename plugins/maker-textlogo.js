let effects = [
  'snow3d','anonymhacker','aovwallpaper','avatarlolnew','beautifulflower',
  'birthdaycake','birthdayday','cartoongravity','codwarzone','cutegravity',
  'fpslogo','freefire','galaxybat','galaxystyle','galaxywallpaper','glittergold',
  'greenbush','greenneon','heartshaped','hologram3d','juventusshirt','lighttext',
  'logogaming','lolbanner','luxurygold','metallogo','mlwallpaper','multicolor3d',
  'noeltext','pubgmaskot','puppycute','realvintage','royaltext','silverplaybutton',
  'starsnight','textbyname','textcake','valorantbanner','watercolor','wetglass',
  'wooden3d','writegalaxy'
]

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
`🖼️ *TEXT LOGO MAKER*

Contoh:
${usedPrefix + command} snow3d|Ryo Yamada

📜 *List Efek:*
${effects.map(v => '• ' + v).join('\n')}`
    )
  }

  let [effect, txt] = text.split('|')
  if (!effect || !txt) {
    return m.reply(`Gunakan format:\n${usedPrefix + command} efek|teks`)
  }

  effect = effect.toLowerCase().trim()
  txt = txt.trim()

  if (!effects.includes(effect)) {
    return m.reply(
`Efek tidak tersedia!

✨ *List Efek:*
${effects.map(v => '• ' + v).join('\n')}`
    )
  }

  await conn.sendMessage(m.chat, {
    react: { text: '🕒', key: m.key }
  })

  let url = `https://api.lolhuman.xyz/api/ephoto1/${effect}?apikey=${global.APIKeys['https://api.lolhuman.xyz']}&text=${encodeURIComponent(txt)}`

  await conn.sendFile(m.chat, url, 'textlogo.jpg', 'Done', m)
}

handler.help = ['textlogo <efek>|<teks>']
handler.tags = ['maker']
handler.command = /^textlogo$/i
handler.limit = true

export default handler