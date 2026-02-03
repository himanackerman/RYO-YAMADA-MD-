import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let res = await fetch(`https://fantox-apis.vercel.app/${command}`)
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.url) throw '❎ Error'

    await m.reply('_📩 Mengirim ke private chat kamu..._')

    // Kirim ke private chat pengirim
    await conn.sendFile(m.sender, json.url, 'img.jpg', `🚩 Random ${command}`, m)

  } catch (e) {
    console.error(e)
    await m.reply('❎ Gagal ambil data.')
  }
}

handler.help = ['genshin', 'swimsuit', 'schoolswimsuit', 'white', 'barefoot', 'touhou', 'gamecg', 'hololive', 'uncensored', 'sunglasses', 'glasses', 'weapon', 'shirtlift', 'chain', 'fingering', 'flatchest', 'torncloth', 'bondage', 'demon', 'wet', 'pantypull', 'headdress', 'headphone', 'tie', 'anusview', 'shorts','stokings', 'topless', 'beach', 'bunnygirl', 'bunnyear', 'idol', 'vampire', 'gun', 'maid', 'bra', 'nobra', 'bikini', 'whitehair', 'blonde', 'pinkhair', 'bed', 'ponytail', 'nude', 'dress', 'underwear', 'foxgirl', 'uniform', 'skirt', 'sex', 'sex2', 'sex3', 'breast', 'twintail', 'spreadpussy', 'tears', 'seethrough', 'breasthold', 'drunk', 'fateseries', 'spreadlegs', 'openshirt', 'headband', 'food', 'close', 'tree', 'nipples', 'erectnipples', 'horns', 'greenhair', 'wolfgirl', 'catgirl']
handler.command = handler.help
handler.tags = ['nsfw']
handler.premium = true
handler.group = false

export default handler