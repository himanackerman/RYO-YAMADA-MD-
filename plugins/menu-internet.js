let handler = async (m) => {
  m.reply(`
╭─────『 Menu Internet 』
ᯓ .fontsearch <text>  Ⓛ
ᯓ .beritabola  Ⓛ
ᯓ .dafont <nama>
ᯓ .fetch <url>
ᯓ .get <url>
ᯓ .githubtrend
ᯓ .groupsearch <kata kunci> Ⓟ
ᯓ .mlhero <nama>  Ⓛ
ᯓ .infoloker
ᯓ .kompas  Ⓛ
ᯓ .mangga-pop
ᯓ .misteri
ᯓ .mltour
ᯓ .playstore <query>
ᯓ .surah
ᯓ .tafsir
ᯓ .worldtime
ᯓ .waktuglobal
ᯓ .jadwalsholat kota
ᯓ .komiksearch <judul>
ᯓ .komikdetail <id/url>
ᯓ .lirik
ᯓ .meme
ᯓ .rrsearch <judul>
ᯓ .rrdetail <url>
ᯓ .rrlatest
ᯓ .rrprofile <url>
ᯓ .pastebin <url>
ᯓ .renungan  Ⓛ
ᯓ .igsearch <query>
ᯓ .iplookup <domain>
ᯓ .gsmarena <nama hp>
ᯓ .ttsba <teks>  Ⓛ
ᯓ .uhdpaper <query>  Ⓛ
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menuinternet$/i
handler.help = ["menuinternet"]
handler.tags = ["main"]
export default handler