let handler = async (m) => {
  m.reply(`
╭─────『 Menu Panel 』
ᯓ .cadmin <username>[,nomor] Ⓟ
ᯓ .1gb <username>[,nomor] Ⓟ
ᯓ .2gb <username>[,nomor] Ⓟ
ᯓ .3gb <username>[,nomor] Ⓟ
ᯓ .4gb <username>[,nomor] Ⓟ
ᯓ .5gb <username>[,nomor] Ⓟ
ᯓ .6gb <username>[,nomor] Ⓟ
ᯓ .7gb <username>[,nomor] Ⓟ
ᯓ .8gb <username>[,nomor] Ⓟ
ᯓ .9gb <username>[,nomor] Ⓟ
ᯓ .10gb <username>[,nomor] Ⓟ
ᯓ .unlimited <username>[,nomor] Ⓟ
ᯓ .unli <username>[,nomor] Ⓟ
ᯓ .deladmin <id_user_admin>
ᯓ .delpanel
ᯓ .listadmin Ⓟ
ᯓ .listpanel Ⓟ
ᯓ .listp Ⓟ
ᯓ .listserver Ⓟ
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menupanel$/i
export default handler