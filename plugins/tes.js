let handler = async (m) => {
  let ryo = `
*「 🎸 Ryo Yamada 」*

Hmph... apa sih, manggil-manggil Ryo segala... 🙄  
Yasudah, kalau kamu *beneran* butuh, ketik aja *.menu* ✨  

(Tapi jangan ganggu aku lagi latihan bass, ya...) 😏
`
  await m.reply(ryo)
}

handler.customPrefix = /^(tes|bot|ryo|yamadabot|test)$/i
handler.command = new RegExp

export default handler