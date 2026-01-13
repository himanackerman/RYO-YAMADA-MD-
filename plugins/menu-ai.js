let handler = async (m) => {
  m.reply(`
*╭─────『 Menu AI 』
ᯓ .ai3d <teks>  Ⓛ
ᯓ .ai4chat <teks>  Ⓛ
ᯓ .aoyoai <teks>
ᯓ .askai <model> <pertanyaan>  Ⓛ
ᯓ .listmodel  Ⓛ
ᯓ .ayesoul <teks>
ᯓ .blackbox  Ⓛ
ᯓ .bocchiai <teks>
ᯓ .copilot <teks>
ᯓ .claudeai <text>  Ⓛ
ᯓ .aicode <prompt>|<bahasa>|<model>  Ⓛ
ᯓ .codegen <lang> <model> <prompt>  Ⓛ
ᯓ .colorify [anime/ghibli] [prompt]  Ⓛ
ᯓ .dopple  Ⓛ
ᯓ .editfoto <prompt>  Ⓛ
ᯓ .elainaai <pesan>
ᯓ .feloai <teks>
ᯓ .ghibli
ᯓ .gptonline <teks>  Ⓛ
ᯓ .gpt <teks>  Ⓛ
ᯓ .hoshino <teks>  Ⓛ
ᯓ .hutaoai <teks>  Ⓛ
ᯓ .img2promt  Ⓛ
ᯓ .kitaai <pesan>
ᯓ .nijikaai <pesan>
ᯓ .openai <teks>  Ⓛ
ᯓ .prabowo  Ⓛ
ᯓ .ryoai <pesan>
ᯓ .t2v  Ⓛ
ᯓ .texttovideo  Ⓛ
ᯓ .text2img <prompt>  Ⓛ
ᯓ .waguri <pesan>
ᯓ .ai <pertanyaan>  Ⓛ
ᯓ .ai set <model> | <prompt>  Ⓛ
ᯓ .toanime  Ⓛ
ᯓ .editimage  Ⓛ
ᯓ .simi  Ⓛ
ᯓ .removebg  Ⓛ
ᯓ .removebg2  Ⓛ
ᯓ .tofigure2  Ⓛ
ᯓ .tofigure  Ⓛ
╰–––––––––––––––༓
`.trim())
}
handler.command = /^menuai$/i
handler.help = ["menuai"]
handler.tags = ["main"]
export default handler