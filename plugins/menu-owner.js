let handler = async (m) => {
  m.reply(`
╭─────『 Menu Owner 』
ᯓ .enable <option>
ᯓ .disable <option>
ᯓ .delexpired
ᯓ .msgch Ⓟ
ᯓ .oadd @user
ᯓ .o+ @user
ᯓ .addlimit
ᯓ .addowner <nomor>
ᯓ .addprem @user 7
ᯓ .addprem 628xxxxx 7
ᯓ .autotyping [on/off]
ᯓ .balas-img <nomor|pesan>
ᯓ .balas <nomor|pesan>
ᯓ .banchat
ᯓ .ban
ᯓ .broadcast <teks>
ᯓ .bcgc <teks>
ᯓ .checkerror
ᯓ .clearchat
ᯓ .clearsession
ᯓ .deleteplugin <namafile>
ᯓ .delprem
ᯓ .deleteuser
ᯓ .getdb
ᯓ .getplugin <text>
ᯓ .join <chat.whatsapp.com> Ⓟ
ᯓ .leavegc
ᯓ .out
ᯓ .listplugin
ᯓ .opromote @tag
ᯓ .pushkontak
ᯓ .resetchat
ᯓ .restart
ᯓ .getsession
ᯓ .setbio
ᯓ .saveplugin
ᯓ .simulate <event> [@mention]
ᯓ .o-tagall
ᯓ .upswimage
ᯓ .upswvideo
ᯓ .upswtext
ᯓ .upswaudio
ᯓ .upsw
ᯓ .unbanchat
ᯓ .unban
ᯓ .playch <judul>
ᯓ .reactch <idsaluran> <message_id> <emoji> Ⓟ
ᯓ .resetlimit
ᯓ .self
ᯓ .public
ᯓ .up-pb
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menuowner$/i
handler.help = ["menuowner"]
handler.tags = ["main"]
export default handler