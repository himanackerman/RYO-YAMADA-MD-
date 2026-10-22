import { sticker } from '../../lib/sticker.js'

let handler = async (m, { conn, args }) => {
  var arr = ["atas", "bawah"]
  if (!arr.includes(args[0])) throw "Pilih *atas* atau *bawah*!"
  var terbang = arr[Math.floor(Math.random() * arr.length)]
  var res
  var pesan
  var stiker
  var MiliSecond = 3000 // 3 seconds

  let coins = parseInt(Math.floor(Math.random() * 100000))
  let exp = parseInt(Math.floor(Math.random() * 10000))
  let player = global.db.data.users[m.sender]
  if (!player) throw "Data pengguna tidak ditemukan. Pastikan Anda terdaftar!"

  const packname = 'ʀyᴏ yᴀᴍᴀᴅᴀ - ᴍᴅ'
  const author = 'ʙy ʜɪʟᴍᴀɴ'

  if (terbang === "atas") {
    res = "https://cdn-icons-png.flaticon.com/512/1490/1490832.png"
    // sticker(img, url, packname, author)
    stiker = await sticker(false, res, packname, author)
    await conn.sendMessage(m.chat, { sticker: stiker })

    pesan = `*[ Menang ]*\n\nKamu Mendapatkan:\n+ Rp ${new Intl.NumberFormat('id-ID').format(coins)} Money\n+ ${new Intl.NumberFormat('id-ID').format(exp)} XP`

    setTimeout(() => {
      conn.reply(m.chat, pesan, m)
    }, MiliSecond)

    player.money = (player.money || 0) + coins
    player.exp = (player.exp || 0) + exp
    player.tiketcoin = (player.tiketcoin || 0) + 1
  } else if (terbang === "bawah") {
    res = "https://cdn-icons-png.flaticon.com/512/4315/4315581.png"
    stiker = await sticker(false, res, packname, author)
    await conn.sendMessage(m.chat, { sticker: stiker })

    pesan = `*[ Kalah ]*\n\nKamu Kehilangan:\n- Rp ${new Intl.NumberFormat('id-ID').format(coins)} Money\n- ${new Intl.NumberFormat('id-ID').format(exp)} XP`

    setTimeout(() => {
      conn.reply(m.chat, pesan, m)
    }, MiliSecond)

    player.money = (player.money || 0) - coins
    player.exp = (player.exp || 0) - exp
    player.tiketcoin = (player.tiketcoin || 0) - 1
  }
}

handler.help = ["putarkoin"]
handler.tags = ["rpg"]
handler.command = /^(putarkoin)$/i

export default handler