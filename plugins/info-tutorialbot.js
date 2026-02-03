let hlmn = async (m, { conn }) => {

let hlmn = `
╭╾• 〔 T U T O R I A L   B O T 〕
│
├  Sebelum memakai bot, lakukan pendaftaran
├  Ketik : .daftar Nama.Umur
│
├  Bot menggunakan prefix : . atau /
├  Pastikan command sesuai dengan prefix
├  Bot tidak merespon jika salah penulisan
│
├  Gunakan menu untuk melihat daftar fitur
├  Ketik : .menu atau .menu all
│
├  Fitur Sticker
├  Ketik : .brat <text>
│
├  Download Video TikTok
├  Ketik : .tiktok <link>
├  Atau : .tt <link>
│
├  Download Musik
├  Ketik : .play <judul lagu>
│
├  Fitur Game
├  Ketik : .susunkata
│
├  Fitur RPG
├  Ketik : .bank
├  Ketik : .kerja
├  Ketik : .inventory
│
├  Fitur AI & Tools
├  Ketik : .ai <pertanyaan>
├  Ketik : .qc <text>
├  Ketik : .toimg
├  Ketik : .removebg
│
├  Gunakan fitur dengan benar dan seperlunya
├  Beri jeda agar bot tetap stabil
│
└─「 Ryo Yamada md 」
`

conn.reply(m.chat, hlmn.trim(), global.fkontak)
}

hlmn.help = ["tutorialbot", "tutorbot"]
hlmn.tags = ["info"]
hlmn.command = /^(tutorialbot|tutorbot)$/i
hlmn.group = true

export default hlmn