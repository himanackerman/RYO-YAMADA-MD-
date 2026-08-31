let handler = async (m, { conn }) => {
  try {
    const totalPlugin = Object.keys(global.plugins).length

    const totalFitur = Object.values(global.plugins)
      .filter(v => v.help && v.tags && !v.disabled)
      .flatMap(v => v.help)
      .length

    const text = `*\`Total Fitur\`*

✿ Total Plugin : ${totalPlugin}
✿ Total Fitur : ${totalFitur}`

    await conn.sendMessage(
      m.chat,
      { text },
      { quoted: m }
    )

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