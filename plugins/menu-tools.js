let handler = async (m) => {
  m.reply(`
  ╭─────『 Menu Tools 』
ᯓ .codegen <lang> <model> <prompt>  Ⓛ
ᯓ .bratb
ᯓ .ccgen <type> <jumlah>
ᯓ .checkphishing <url>  Ⓛ
ᯓ .editimage  Ⓛ
ᯓ .getcode <url>
ᯓ .penghitaman
ᯓ .cuaca
ᯓ .ssweb <url>  Ⓛ
ᯓ .spamngl <link> <jumlah> <pesan> Ⓟ
ᯓ .pinlens
ᯓ .rch
ᯓ .removebg  Ⓛ
ᯓ .removebg2  Ⓛ
ᯓ .searchcode <query>
ᯓ .fstik Ⓟ
ᯓ .tempmail  Ⓛ
ᯓ .cekmail <token>  Ⓛ
ᯓ .pesanmail <id>  Ⓛ
ᯓ .tobotak  Ⓛ
ᯓ .checkhost
ᯓ .cekhost
ᯓ .chord <judul lagu>  Ⓛ
ᯓ .jarak dari|ke
ᯓ .ip  Ⓛ
ᯓ .jadwaltv
ᯓ .morse
ᯓ .demorse
ᯓ .qr <teks>
ᯓ .readmore <teks>|<teks>
ᯓ .read
ᯓ .spamwa <number>|<mesage>|<no of messages>  Ⓛ
ᯓ .translate *ᴛᴇxᴛ*
ᯓ .amdata
ᯓ .breach <email>  Ⓛ
ᯓ .catbox  Ⓛ
ᯓ .cekidch
ᯓ .cekidch2 <link>
ᯓ .cekresi <no resi>|<ekspedisi>  Ⓛ
ᯓ .promptcode  Ⓛ
ᯓ .detectbug  Ⓛ
ᯓ .convertcode  Ⓛ
ᯓ .explaincode  Ⓛ
ᯓ .imagesolve  Ⓛ
ᯓ .encode
ᯓ .decode
ᯓ .ekspedisilist
ᯓ .encode
ᯓ .decode
ᯓ .enhance
ᯓ .gsmarena <nama hp>
ᯓ .upscale  Ⓛ
ᯓ .hd2 <scale> <type>  Ⓛ
ᯓ .hd4  Ⓛ
ᯓ .hdvid <resolusi>  Ⓛ
ᯓ .imgtools <type>  Ⓛ
ᯓ .mikutalk <teks>  Ⓛ
ᯓ .nik <nomor>
ᯓ .numbgen
ᯓ .ocr
ᯓ .redirect
ᯓ .rvo  Ⓛ
ᯓ .s2c <url>
ᯓ .shareteks teks  Ⓛ
ᯓ .tembox [prefix]  Ⓛ
ᯓ .temboxcek <token>  Ⓛ
ᯓ .copy email/token <isi>  Ⓛ
ᯓ .tomp3  Ⓛ
ᯓ .unblur  Ⓛ
ᯓ .unblur mild  Ⓛ
ᯓ .tourl
ᯓ .upload
ᯓ .transcibe url-video-yt  Ⓛ
ᯓ .ondoku <voice|text>  Ⓛ
ᯓ .voiceondoku  Ⓛ
ᯓ ..tts jokowi  Ⓛ
ᯓ ..tts prabowo  Ⓛ
ᯓ ..tts megawati  Ⓛ
ᯓ .ttsai <model/random/list> | <teks>  Ⓛ
ᯓ .ttsba <teks>  Ⓛ
ᯓ .waifuhtm [filter]  Ⓛ
ᯓ .waifufilterlist  Ⓛ
ᯓ .wrml <totalMatch> <winMatch> <targetWR%>  Ⓛ
ᯓ .yts <query>  Ⓛ
╰–––––––––––––––༓
    `.trim())
}
handler.command = /^menutools$/i
handler.help = ["menutools"]
handler.tags = ["main"]
export default handler