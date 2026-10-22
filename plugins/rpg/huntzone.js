let Fruatre = async (m, { conn, command, args }) => {
  let type = (args[0] || '').toLowerCase()
  let quantity = parseInt(args[1]) || 1

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]

  user.money = user.money || 0

  const allItems = [
    "nugget","aqua","rendang","salads","steak","candy","ramen","pizza","vodka","sushi","bandage","ganja","roti",
    "spagetti","croissant","onigiri","hamburger","hotdog","cake","sandwich","escream","pudding","juice","teh",
    "popcorn","kopi","soju","kopimatcha","susu","boba","kentang","soda"
  ]

  for (let item of allItems) if (user[item] === undefined) user[item] = 0

  const foodPrices = {
    nugget:10000,aqua:2000,rendang:30000,salads:50000,steak:500000,
    candy:10000,ramen:25000,pizza:50000,vodka:30000,sushi:35000,
    bandage:60000,roti:15000,spagetti:10000,croissant:50000,ganja:500000,
    onigiri:20000,hamburger:30000,soda:10000,hotdog:25000,cake:150000,
    sandwich:350000,escream:20000,pudding:40000,juice:25000,teh:10000,
    popcorn:15000,kopi:5000,soju:50000,kopimatcha:30000,susu:15000,boba:20000,
    kentang:20000
  }

  const food = {
    nugget:'Nugget',rendang:'Rendang',salads:'Salads',steak:'Steak',candy:'Candy',
    ramen:'Ramen',pizza:'Pizza',vodka:'Vodka',sushi:'Sushi',bandage:'Bandage',
    roti:'Roti',aqua:'Aqua',spagetti:'Spagetti',croissant:'Croissant',ganja:'Ganja',
    onigiri:'Onigiri',hamburger:'Hamburger',hotdog:'Hotdog',cake:'Cake',
    sandwich:'Sandwich',escream:'Escream',pudding:'Pudding',juice:'Juice',
    teh:'Teh',popcorn:'Popcorn',kopi:'Kopi',soju:'Soju',susu:'Susu',
    kopimatcha:'Kopi Matcha',boba:'Boba',kentang:'Kentang',soda:'Soda'
  }

  const caption = `
🛒 *7 E L E V E N — MARKET*

🥤 *DRINK*
🍷 Vodka : ${foodPrices.vodka}
🥤 Aqua : ${foodPrices.aqua}
☕ Kopi : ${foodPrices.kopi}
🍺 Soda : ${foodPrices.soda}
🍵 Teh : ${foodPrices.teh}
🧃 Juice : ${foodPrices.juice}
🍾 Soju : ${foodPrices.soju}
🍵 Matcha : ${foodPrices.kopimatcha}
🧋 Boba : ${foodPrices.boba}
🥛 Susu : ${foodPrices.susu}

🍔 *FOOD*
🍞 Roti : ${foodPrices.roti}
🍜 Ramen : ${foodPrices.ramen}
🍣 Sushi : ${foodPrices.sushi}
🥩 Steak : ${foodPrices.steak}
🥘 Rendang : ${foodPrices.rendang}
🍱 Nugget : ${foodPrices.nugget}
🥗 Salads : ${foodPrices.salads}
🍬 Candy : ${foodPrices.candy}
🍕 Pizza : ${foodPrices.pizza}
💉 Bandage : ${foodPrices.bandage}
🍀 Ganja : ${foodPrices.ganja}
🍝 Spagetti : ${foodPrices.spagetti}
🍰 Cake : ${foodPrices.cake}
🥐 Croissant : ${foodPrices.croissant}
🍙 Onigiri : ${foodPrices.onigiri}
🍔 Hamburger : ${foodPrices.hamburger}
🌭 Hotdog : ${foodPrices.hotdog}
🍨 Escream : ${foodPrices.escream}
🍮 Pudding : ${foodPrices.pudding}
🍿 Popcorn : ${foodPrices.popcorn}
🍟 Kentang : ${foodPrices.kentang}

Contoh:
.buyfood nugget 5
.buydrink aqua 3
`.trim()

  const THUMB_URL = 'https://telegra.ph/file/5cbeb37c4278b29f4fded.jpg'

  try {
    if (/foodshop|buyfood|buydrink/i.test(command)) {
      if (!foodPrices[type]) {
        return conn.sendMessage(m.chat, {
          image: { url: THUMB_URL },
          caption
        }, { quoted: m })
      }

      if (quantity < 1) return m.reply('Jumlah pembelian tidak valid.')

      const foodPrice = foodPrices[type] * quantity
      if (user.money < foodPrice)
        return m.reply(`Uang kamu kurang buat beli ${quantity} ${food[type]}`)

      user.money -= foodPrice
      user[type] += quantity

      m.reply(`✅ Berhasil membeli ${quantity} ${food[type]}\n💸 Harga: Rp${foodPrice.toLocaleString('id-ID')}`)
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: THUMB_URL },
        caption
      }, { quoted: m })
    }
  } catch (err) {
    m.reply("Error:\n" + err.stack)
  }
}

Fruatre.help = ['marketstall','foodshop','7eleven','buyfood <food> <jumlah>','buydrink <drink> <jumlah>']
Fruatre.tags = ['rpg']
Fruatre.command = /^(marketstall|foodshop|7eleven|buyfood|buydrink)/i

export default Fruatre