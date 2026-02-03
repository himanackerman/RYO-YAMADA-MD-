let handler = async (m, { conn }) => {
  let ryo = `
*「 🎸 Ryo Yamada 」*

Hmph... apa sih, manggil-manggil Ryo segala... 🙄  
Yasudah, kalau kamu *beneran* butuh, ketik aja *.menu* ✨  

(Tapi jangan ganggu aku lagi latihan bass, ya...) 😏
`

  await conn.sendMessage(
    m.chat,
    {
      text: ryo,
      contextInfo: global.adReply.contextInfo
    },
    {
      quoted: global.fstatus
    }
  )
}

handler.customPrefix = /^(tes|bot|ryo|yamadabot|test)$/i
handler.command = new RegExp

export default handler