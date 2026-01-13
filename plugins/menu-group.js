let handler = async (m) => {
  m.reply(`
  ╭─────『  ⛩️Group 』
ᯓ .getpp <@tag/reply>
ᯓ .enable <option>
ᯓ .disable <option>
ᯓ .cekexpired
ᯓ .add @user/628xxxx
ᯓ .+ @user/628xxxx
ᯓ .cekasalmember
ᯓ .demote @tag
ᯓ .hidetag
ᯓ .infogc
ᯓ .kick
ᯓ .linkgroup
ᯓ .opentime <angka> <unit>
ᯓ .poll
ᯓ .setbye
ᯓ .setpp
ᯓ .gc *open / close*
ᯓ .setwelcome
ᯓ .gcsider
ᯓ .tagall
ᯓ .tagsw <group_id> <teks>
ᯓ .totag
ᯓ .totalpesan
ᯓ .tutupjam <jam:menit>
ᯓ .bukajam <jam:menit>
ᯓ .kudeta
ᯓ .kudetagc
ᯓ .kick @user
ᯓ .spamtag @user
ᯓ .antitagsw on/off
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menugroup$/i
export default handler