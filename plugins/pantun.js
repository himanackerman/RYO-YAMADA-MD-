// pantun random
let handler = async (m) => {
  try {
    let res = await fetch(`https://api-faa.my.id/faa/pantun`)
    let data = await res.json()

    if (!data.status) throw 'yah error'

    let pantun = data.pantun || "Pantun tidak ditemukan."

    m.reply(pantun)

  } catch (e) {
    console.error(e)
    m.reply('❗ error.')
  }
}

handler.help = ['pantun']
handler.tags = ['fun']
handler.command = /^pantun$/i
handler.limit = false

export default handler