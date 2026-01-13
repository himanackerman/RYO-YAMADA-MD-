/*
* Nama Fitur : Pinterest Downloader
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzXD
*/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`url videy nya mana bang?\ncontoh : ${usedPrefix + command} https://videy.co/v?id=4F2uO7k21`)

  try {
    const parsed = new URL(text)
    const id = parsed.searchParams.get('id')

    if (!id) throw 'url ga validd harus mengandung parameter id contoh : https://videy.co/v?id=abc123'

    const videoUrl = `https://cdn.videy.co/${id}.mp4`
    const filename = `zenzxz_${id}.mp4`

    await conn.sendFile(m.chat, videoUrl, filename, `*Videy downloader*`, m)
  } catch (e) {
    m.reply(`Eror kak : ${e?.message || e}`)
  }
}

handler.command = ['videydl']
handler.tags = ['downloader']
handler.help = ['videydl <url>']
handler.premium = true

export default handler