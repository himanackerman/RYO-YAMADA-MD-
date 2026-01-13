let handler = async (m, { text }) => {
  if (!text) return m.reply('💌 Masukkan nama orang yang mau kamu kirimi surat cinta palsu.\n\nContoh: .suratcinta Hilman')

  const target = text
  const pembuka = [
    `Untukmu yang selalu hadir dalam lamunanku, ${target},`,
    `Dear ${target},`,
    `Kepada ${target} yang diam-diam kucintai,`,
    `Hai ${target}, bintang di langit malamku,`,
    `Wahai ${target}, pemilik senyum yang menghancurkan dompetku,`
  ]

  const isi = [
    `Setiap kali aku melihat status-mu, hatiku bergetar seperti sinyal WiFi tetangga.`,
    `Kau hadir dalam hidupku bagaikan notif Shopee di tengah malam, mengejutkan tapi bikin senang.`,
    `Aku tau kamu bukan SPBU, tapi kenapa kamu selalu ngisi hatiku?`,
    `Kalau cinta itu buta, maka aku sudah lama tersesat di labirin wajahmu.`,
    `Tanpamu hidupku seperti Indomie tanpa micin, hambar dan menyedihkan.`
  ]

  const penutup = [
    `Salam terhangat, dari seseorang yang bahkan kamu gak save nomornya.`,
    `Dari aku, yang hanya bisa memandangmu dari status WhatsApp.`,
    `Dengan penuh cinta palsu,`,
    `Yang mencintaimu dalam diam dan chat yang tak pernah kamu balas.`,
    `Sekian, sebelum kamu buang surat ini ke spam.`
  ]

  const surat = `${pick(pembuka)}\n\n${pick(isi)}\n\n${pick(penutup)}`
  m.reply(`💌 *Surat Cinta Palsu*\n\n${surat}`)
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

handler.help = ['suratcinta <nama>']
handler.tags = ['fun']
handler.command = /^suratcinta$/i
handler.limit = false

export default handler