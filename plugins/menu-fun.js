let handler = async (m) => {
  m.reply(`
╭─────『 Menu Fun 』
ᯓ .cekkhodam *<name>*
ᯓ .cekkontol *<name>*
ᯓ .cekmemek *<name>*
ᯓ .alay  Ⓛ
ᯓ .angka <0-9>
ᯓ .apakah <teks>?
ᯓ .benarkah <text>
ᯓ .bisakah <pertanyaan>
ᯓ .cantikcek
ᯓ .cektt *<name>*
ᯓ .dimanakah <pertanyaan>
ᯓ .jadian
ᯓ .kapankah <pertanyaan>
ᯓ .kematian <nama opsional>
ᯓ .kerang <teks>
ᯓ .kerangajaib <teks>
ᯓ .dreamworld  Ⓛ
ᯓ .dream  Ⓛ
ᯓ .mimpi  Ⓛ
ᯓ .dreamexp  Ⓛ
ᯓ .ramal <nama opsional>
ᯓ .seberapagila <nama opsional>
ᯓ .sipaling <teks>
ᯓ .suratcinta <nama>
ᯓ .tebakumur <name>
ᯓ .top
ᯓ .goblokcek  Ⓛ
ᯓ .jelekcek  Ⓛ
ᯓ .gaycek  Ⓛ
ᯓ .rate  Ⓛ
ᯓ .lesbicek  Ⓛ
ᯓ .gantengcek  Ⓛ
ᯓ .cantikcek  Ⓛ
ᯓ .begocek  Ⓛ
ᯓ .suhucek  Ⓛ
ᯓ .pintercek  Ⓛ
ᯓ .jagocek  Ⓛ
ᯓ .nolepcek  Ⓛ
ᯓ .babicek  Ⓛ
ᯓ .bebancek  Ⓛ
ᯓ .baikcek  Ⓛ
ᯓ .jahatcek  Ⓛ
ᯓ .anjingcek  Ⓛ
ᯓ .haramcek  Ⓛ
ᯓ .pakboycek  Ⓛ
ᯓ .pakgirlcek  Ⓛ
ᯓ .sangecek  Ⓛ
ᯓ .bapercek  Ⓛ
ᯓ .fakboycek  Ⓛ
ᯓ .alimcek  Ⓛ
ᯓ .suhucek  Ⓛ
ᯓ .fakgirlcek  Ⓛ
ᯓ .kerencek  Ⓛ
ᯓ .wibucek  Ⓛ
ᯓ .pasarkascek  Ⓛ
ᯓ .kulcek  Ⓛ
ᯓ .cekgoblok  Ⓛ
ᯓ .cekjelek  Ⓛ
ᯓ .cekgay  Ⓛ
ᯓ .ceklesbi  Ⓛ
ᯓ .cekganteng  Ⓛ
ᯓ .cekcantik  Ⓛ
ᯓ .cekbego  Ⓛ
ᯓ .ceksuhu  Ⓛ
ᯓ .cekpinter  Ⓛ
ᯓ .cekjago  Ⓛ
ᯓ .ceknolep  Ⓛ
ᯓ .cekbabi  Ⓛ
ᯓ .cekbeban  Ⓛ
ᯓ .cekbaik  Ⓛ
ᯓ .cekjahat  Ⓛ
ᯓ .cekanjing  Ⓛ
ᯓ .cekharam  Ⓛ
ᯓ .cekpakboy  Ⓛ
ᯓ .cekpakgirl  Ⓛ
ᯓ .ceksange  Ⓛ
ᯓ .cekbaper  Ⓛ
ᯓ .cekfakboy  Ⓛ
ᯓ .cekalim  Ⓛ
ᯓ .ceksuhu  Ⓛ
ᯓ .cekfakgirl  Ⓛ
ᯓ .cekkeren  Ⓛ
ᯓ .cekwibu  Ⓛ
ᯓ .cekpasarkas  Ⓛ
ᯓ .cekkul  Ⓛ
ᯓ .suitpvp
ᯓ .sertifikatcinta <nama>
ᯓ .sertifikatlemot <nama>
ᯓ .moveon
ᯓ .soundmeme-listnama nama
ᯓ .soundmeme-random
ᯓ .soundmeme-search nama
ᯓ .morse
ᯓ .demorse
ᯓ ..ara
ᯓ ..lopyou
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menufun$/i
handler.help = ["menufun"]
handler.tags = ["main"]
export default handler