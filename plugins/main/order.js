const orders = {
  '3': { name: '3 Day Premium', price: 'Rp. 2.000' },
  '7': { name: '7 Day Premium', price: 'Rp. 3.000' },
  '30': { name: '30 Day Premium', price: 'Rp. 10.000' },
  '60': { name: '60 Day Premium', price: 'Rp. 20.000' },
  '90': { name: '90 Day Premium', price: 'Rp. 30.000' },
  '365': { name: '365 Day Premium', price: 'Rp. 100.000' },

  'G7': { name: '7 Day Join Group', price: 'Rp. 3.000' },
  'G30': { name: '30 Day Join Group', price: 'Rp. 10.000' },
  'G365': { name: '365 Day Join Group', price: 'Rp. 100.000' }
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    const rich = new AIRich(conn)
      .setTitle('PREMIUM & SEWA BOT')

      .addText(
        'Daftar paket Premium dan Sewa Bot.',
        { id: 'intro' }
      )

      .addText(
        '*Premium*',
        { id: 'premiumTitle' }
      )

      .addTable(
        [
          ['Kode', 'Paket', 'Harga'],
          ['3', '3 Day Premium', 'Rp. 2.000'],
          ['7', '7 Day Premium', 'Rp. 3.000'],
          ['30', '30 Day Premium', 'Rp. 10.000'],
          ['60', '60 Day Premium', 'Rp. 20.000'],
          ['90', '90 Day Premium', 'Rp. 30.000'],
          ['365', '365 Day Premium', 'Rp. 100.000']
        ],
        { id: 'premiumTable' }
      )

      .addText(
        '*Sewa Bot*',
        { id: 'groupTitle' }
      )

      .addTable(
        [
          ['Kode', 'Paket', 'Harga'],
          ['G7', '7 Day Join Group', 'Rp. 3.000'],
          ['G30', '30 Day Join Group', 'Rp. 10.000'],
          ['G365', '365 Day Join Group', 'Rp. 100.000']
        ],
        { id: 'groupTable' }
      )

      .addText(
        `*Cara Order*

.sewa <kode>

Contoh:
.sewa 30
.sewa G30`,
        { id: 'orderInfo' }
      )

      .addFooterAction(
        {
          text: 'Hubungi Owner',
          url: 'https://wa.me/' + String(global.owner[0]).replace(/[^0-9]/g, '')
        },
        { id: 'ownerButton' }
      )

      .setFooter('Ryo Yamada MD')

    return await rich.send(m.chat, { quoted: m })
  }

  const code = text.trim().toUpperCase()

  if (!orders[code]) {
    return m.reply(
      'Kode paket tidak ditemukan.\n\nKetik *.sewa* untuk melihat daftar paket.'
    )
  }

  const paket = orders[code]

  const rich = new AIRich(conn)
    .setTitle('PESANAN BERHASIL')

    .addText(
      `Pesanan kamu berhasil dikirim ke Owner.`,
      { id: 'intro' }
    )

    .addTable(
      [
        ['Informasi', 'Detail'],
        ['Paket', paket.name],
        ['Harga', paket.price]
      ],
      { id: 'orderTable' }
    )

    .addTip(
      'Mohon tunggu konfirmasi dari Owner ya.',
      { id: 'tip' }
    )

    .setFooter('Ryo Yamada MD')

  await rich.send(m.chat, { quoted: m })

  const orderMsg = `🌷 PESANAN BARU

❏ Nama : ${m.pushName}
❏ Paket : ${paket.name}
❏ Harga : ${paket.price}
❏ Waktu : ${new Date().toLocaleString('id-ID')}

Ryo Yamada MD`

  let owner = Array.isArray(global.owner)
    ? global.owner[0]
    : global.owner

  owner = owner.toString().replace(/[^0-9]/g, '')

  await conn.sendMessage(
    owner + '@s.whatsapp.net',
    { text: orderMsg }
  )
}

handler.help = ['sewa', 'premium']
handler.tags = ['main']
handler.command = /^(sewa|premium)$/i

export default handler