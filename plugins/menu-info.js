let handler = async (m) => {
  m.reply(`
  ╭─────『 Menu Info 』
ᯓ .cekwarn
ᯓ .owner
ᯓ .creator
ᯓ .delete
ᯓ .bmkggempa
ᯓ .groups
ᯓ .grouplist
ᯓ .lapor
ᯓ .liburnas
ᯓ .runtime
ᯓ .toplimit
ᯓ .totalfitur
ᯓ .infogempa
ᯓ .limit
ᯓ .premlist [angka]
ᯓ .owner
ᯓ .creator
ᯓ .ping
ᯓ .speed
ᯓ .info
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menuinfo$/i
handler.help = ["menuinfo"]
handler.tags = ["main"]
export default handler