import fetch from 'node-fetch'
const base = 'https://raw.githubusercontent.com/KazukoGans/database/main/anime/'

let handler = async (m, { conn, command }) => {
  await m.react('✨')

  try {
    let res = await fetch(`${base}${command}.json`)
    let json = await res.json()

    if (!json.length) throw 'Tidak ditemukan'

    let img = json[Math.floor(Math.random() * json.length)]

    await new AIRich(conn)
      .setFooter(`❀ Character : ${command}`)
      .addImage(img)
      .send(m.chat, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Gagal mengambil anime')
  }
}

handler.help = handler.command = [
  'akira', 'akiyama', 'anna', 'asuna', 'ayuzawa', 'boruto', 'chitanda', 'chitoge',
  'deidara', 'doraemon', 'emilia', 'erza', 'gremory', 'hestia', 'hinata', 'inori',
  'itachi', 'isuzu', 'itori', 'kaga', 'kagura', 'kakasih', 'kaori', 'kaneki', 'kosaki',
  'kotori', 'kuriyama', 'kuroha', 'kurumi', 'madara', 'mikasa', 'miku', 'minato',
  'naruto', 'natsukawa', 'neko2', 'nekohime', 'nezuko', 'nishimiya', 'onepiece',
  'pokemon', 'rem', 'rize', 'sagiri', 'sakura', 'sasuke', 'shina', 'shinka', 'shizuka',
  'shota', 'tomori', 'toukachan', 'tsunade', 'yatogami', 'yuki'
]

handler.tags = ['anime']
handler.limit = true

export default handler