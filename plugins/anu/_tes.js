let handler = async (m) => {
  const ryo = `*\`Ryo Yamada\`*

✿ *\`Status\`* : Online.
✿ *\`Info\`* : Ketik *.menu* untuk melihat semua fitur.

Jangan ganggu aku lagi latihan bass...`

  m.reply(ryo)
}

handler.customPrefix = /^(tes|bot|ryo|yamadabot|test)$/i
handler.command = new RegExp

export default handler