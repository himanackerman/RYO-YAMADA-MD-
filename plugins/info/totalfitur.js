let handler = async (m, { conn }) => {
  try {
    const totalPlugin = Object.keys(global.plugins).length

    const totalFitur = Object.values(global.plugins)
      .filter(v => v.help && v.tags && !v.disabled)
      .flatMap(v => v.help)
      .length

    const text = `✿ Total Plugin : ${totalPlugin}
✿ Total Fitur : ${totalFitur}`

    await new Button(conn)
      .setTitle('Total Fitur')
      .setBody(text)
      .addButton('inapp_signup', {})
      .send(m.chat, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Terjadi error.')
  }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.limit = false

export default handler