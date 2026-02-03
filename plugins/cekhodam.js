let handler = async (m, { conn, command, text }) => {
	
    if (!text) return conn.reply(m.chat, '• *Contoh :* .cekkhodam Hilman', m)
	
  conn.reply(m.chat, `
╭━━━━°「 *khodamnya ${text}* 」°
┊• Nama : ${text}
┃• khodam : ${pickRandom(['Curut Spbu', 'Naga Api', 'Raja Iblis', 'Laba laba Sunda', 'Curut kedelai', 'Sarden kaleng', 'Bakwan Jagung', 
        'Belalang api', 'Tokek betawi', 'Ambatron', 'Kodok Spbu', 'Macan Sawah', 'Naga Es', 'Cicak Spbu', 
        'Kalajengking', 'Kupu kupu Api', 'Kaleng Cat Avian', 'Pipa Rucika', 'Botol Tupperware', 'Badut Mixue', 
        'Sabun GIV', 'Sandal Swallow', 'Jarjit', 'Ijat', 'Fizi', 'Mail', 'Ehsan', 'Upin', 'Ipin', 'sungut lele', 
        'Tok Dalang', 'Opah', 'Opet', 'Alul', 'Pak Vinsen', 'Maman Resing', 'Pak RT', 'Admin ETI', 'Bung Towel', 
        'Lumpia Basah', 'Martabak Manis', 'Baso Tahu', 'Tahu Gejrot', 'Dimsum', 'Seblak Ceker', 'Telor Gulung', 
        'Tahu Aci', 'Tempe Mendoan', 'Nasi Kucing', 'Kue Cubit', 'Tahu Sumedang', 'Nasi Uduk', 'Wedang Ronde', 
        'Kerupuk Udang', 'Cilok', 'Cilung', 'Kue Sus', 'Jasuke', 'Seblak Makaroni', 'Sate Padang', 'Sayur Asem', 
        'Kromboloni', 'Marmut Pink', 'Belalang Mullet', 'Kucing Oren', 'Lintah Terbang', 'Singa Paddle Pop', 
        'Macan Cisewu', 'Vario Mber', 'Beat Mber', 'Supra Geter', 'Oli Samping', 'Knalpot Racing', 'Jus Stroberi', 
        'Jus Alpukat', 'Alpukat Kocok', 'Es Kopyor', 'Es Jeruk', 'Cappucino Cincau', 'Jasjus Melon', 'Teajus Apel', 
        'Pop ice Mangga', 'Teajus Gulabatu', 'Air Selokan', 'Air Kobokan', 'TV Tabung', 'Keran Air', 'Tutup Panci', 
        'Kotak Amal', 'Tutup Termos', 'Tutup Botol', 'Kresek Item', 'Kepala Casan', 'Ban Serep', 'Kursi Lipat', 
        'Kursi Goyang', 'Kulit Pisang', 'Warung Madura', 'Gorong-gorong'])}
╰═┅═━––––––๑
`.trim(), m)
}
handler.help = ['cekkhodam *<name>*']
handler.tags = ['fun']
handler.command = /^cekkhodam/i

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}