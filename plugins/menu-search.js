let handler = async (m) => {
  m.reply(`
╭─────『 Menu Search 』
ᯓ .spotify <lagu>
ᯓ .googleimg
ᯓ .komiku <query>  Ⓛ
ᯓ .carigrup <keyword1,keyword2> Ⓟ Ⓛ
ᯓ .kurogaze <judul>  Ⓛ
ᯓ .mcaddon
ᯓ .sfilesearch
ᯓ .soundmeme-listnama nama
ᯓ .soundmeme-random
ᯓ .soundmeme-search nama
ᯓ .spotifys <query>
ᯓ .stickerlysearch <keyword>  Ⓛ
ᯓ .tiktoksearch
ᯓ .uptodown <nama aplikasi>
ᯓ .wiki
ᯓ .pin
ᯓ .pinterest2 <query> <jumlah>  Ⓛ
ᯓ .igsearch <query>
ᯓ .ytstalk  Ⓛ
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menusearch$/i
handler.help = ["menusearch"]
handler.tags = ["main"]
export default handler