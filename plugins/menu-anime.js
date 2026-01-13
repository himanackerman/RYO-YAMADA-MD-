let handler = async (m) => {
  m.reply(`
╭─────『 Menu Anime 』
ᯓ .anichinseri <url>  Ⓛ
ᯓ .anilist <search|detail|populer> <query>
ᯓ .bluearchive  Ⓛ
ᯓ .fanart
ᯓ .animesearch
ᯓ .animeinfo <anime>
ᯓ .toanime  Ⓛ
ᯓ .loli
ᯓ .loli2  Ⓛ
ᯓ .anime <judul>
ᯓ .akira  Ⓛ
ᯓ .akiyama  Ⓛ
ᯓ .anna  Ⓛ
ᯓ .asuna  Ⓛ
ᯓ .ayuzawa  Ⓛ
ᯓ .boruto  Ⓛ
ᯓ .chitanda  Ⓛ
ᯓ .chitoge  Ⓛ
ᯓ .deidara  Ⓛ
ᯓ .doraemon  Ⓛ
ᯓ .emilia  Ⓛ
ᯓ .asuna  Ⓛ
ᯓ .erza  Ⓛ
ᯓ .gremory  Ⓛ
ᯓ .hestia  Ⓛ
ᯓ .hinata  Ⓛ
ᯓ .inori  Ⓛ
ᯓ .itachi  Ⓛ
ᯓ .isuzu  Ⓛ
ᯓ .itori  Ⓛ
ᯓ .kaga  Ⓛ
ᯓ .kagura  Ⓛ
ᯓ .kakasih  Ⓛ
ᯓ .kaori  Ⓛ
ᯓ .kaneki  Ⓛ
ᯓ .kosaki  Ⓛ
ᯓ .kotori  Ⓛ
ᯓ .kuriyama  Ⓛ
ᯓ .kuroha  Ⓛ
ᯓ .kurumi  Ⓛ
ᯓ .madara  Ⓛ
ᯓ .mikasa  Ⓛ
ᯓ .miku  Ⓛ
ᯓ .minato  Ⓛ
ᯓ .naruto  Ⓛ
ᯓ .natsukawa  Ⓛ
ᯓ .neko2  Ⓛ
ᯓ .nekohime  Ⓛ
ᯓ .nezuko  Ⓛ
ᯓ .nishimiya  Ⓛ
ᯓ .onepiece  Ⓛ
ᯓ .pokemon  Ⓛ
ᯓ .rem  Ⓛ
ᯓ .rize  Ⓛ
ᯓ .sagiri  Ⓛ
ᯓ .sakura  Ⓛ
ᯓ .sasuke  Ⓛ
ᯓ .shina  Ⓛ
ᯓ .shinka  Ⓛ
ᯓ .shizuka  Ⓛ
ᯓ .shota  Ⓛ
ᯓ .tomori  Ⓛ
ᯓ .toukachan  Ⓛ
ᯓ .tsunade  Ⓛ
ᯓ .yatogami  Ⓛ
ᯓ .yuki  Ⓛ
ᯓ .waifu3  Ⓛ
ᯓ .komiku <query>  Ⓛ
ᯓ .kurogaze <judul>  Ⓛ
ᯓ .storyanime  Ⓛ
ᯓ .animestory  Ⓛ
ᯓ .tracemoe  Ⓛ
ᯓ .waifunews
╰–––––––––––––––༓
  `.trim())
}
handler.command = /^menuanime/i
handler.help = ["menuanime"]
handler.tags = ["main"]

export default handler