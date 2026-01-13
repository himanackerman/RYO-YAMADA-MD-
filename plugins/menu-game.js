let handler = async (m) => {
  m.reply(`
╭─────『 MENU GAME 』
ᯓ .blackjack
ᯓ .bomb
ᯓ .caklontong
ᯓ .cerdascermat <matapelajaran> <jumlahsoal>
ᯓ .cc <matapelajaran> <jumlahsoal>
ᯓ .family100
ᯓ .genshinprofile <uid>
ᯓ .kuis
ᯓ .leaderboard <level|limit|exp>
ᯓ .lengkapikalimat
ᯓ .perangsarung @user
ᯓ .siapakahaku
ᯓ .suit  Ⓛ
ᯓ .susunkata  Ⓛ
ᯓ .tebaktebakan
ᯓ .tebakbendera  Ⓛ
ᯓ .tebakgambar
ᯓ .tebakgame
ᯓ .tebakkimia  Ⓛ
ᯓ .tebaklirik
ᯓ .tebaklogo
ᯓ .tebakmakanan
ᯓ .tebaktebakan
ᯓ .togel
ᯓ .angka
ᯓ .stoptogel
ᯓ .truthordare
ᯓ .tod
ᯓ .ulartangga
ᯓ .uno
ᯓ .attack
ᯓ .atk
ᯓ .war
ᯓ .tictactoe
ᯓ .ttt
ᯓ .listhero
ᯓ .heroml
ᯓ .mlhero <nama>  Ⓛ
ᯓ .polisi
ᯓ .polisi cari
ᯓ .polisi status
ᯓ .polisi item <item>
ᯓ .polisi leaderboard
ᯓ .polisi stop
ᯓ .dungeon
ᯓ .survival
ᯓ .wrml <totalMatch> <winMatch> <targetWR%>  Ⓛ
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menugame$/i
handler.help = ["menugame"]
handler.tags = ["main"]
export default handler