/**
 * Fitur    : Search GitHub Gist
 * Type     : Plugins ESM
 * Creator  : Hilman
 * Channel  : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix}${command} query`

  try {
    let hasil = []

    for (let page = 1; page <= 3; page++) {
      let res = await fetch(`https://gist.github.com/search?p=${page}&q=${encodeURIComponent(text)}`)
      let html = await res.text()

      let links = [...html.matchAll(/href="(\/[^"]+)"/g)]
        .map(v => 'https://gist.github.com' + v[1])
        .filter(v => /^https:\/\/gist\.github\.com\/[^/]+\/[a-f0-9]+$/.test(v))

      hasil.push(...links)
    }

    hasil = [...new Set(hasil)]
      .slice(0, 30)
      .map((v, i) => `❀ ${i + 1}. ${v}`)
      .join('\n\n')

    m.reply(hasil || 'Tidak ditemukan')

  } catch {
    throw 'Error'
  }
}

handler.help = ['searchgist']
handler.tags = ['tools']
handler.command = /^searchgist$/i
handler.owner = false

export default handler