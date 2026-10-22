let handler = async (m, { conn }) => {
  try {
    const ryo = `*\`Ryo Yamada\`*

✿ *\`Status\`* : Online.
✿ *\`Info\`* : Ketik *.menu* untuk melihat semua fitur.

Jangan ganggu aku lagi latihan bass...`

    await new Button(conn)
      .setTitle('Ryo Yamada')
      .setBody(ryo)
      .addButton('inapp_signup', {})
      .send(m.chat, { quoted: m })

  } catch (e) {
    m.reply('Terjadi kesalahan saat mengirim pesan.')
  }
}

handler.customPrefix = /^(tes|bot|ryo|yamadabot|test)$/i
handler.command = new RegExp

export default handler