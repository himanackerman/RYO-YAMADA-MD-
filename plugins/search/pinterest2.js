import axios from 'axios'

let handler = async (m, {
conn,
text,
usedPrefix,
command
}) => {
if (!text) {
return m.reply(
'Contoh:\n' +
usedPrefix + command + ' ryo yamada anime'
)
}

await m.react('🕒')

try {
const { data } = await axios.get(
global.APIs.nexray + '/search/pinterest',
{
params: {
q: text
}
}
)

if (
  !data?.status ||
  !Array.isArray(data.result) ||
  data.result.length === 0
) {
  return m.reply('Tidak ada hasil ditemukan.')
}

const results = data.result
  .filter(v => v?.images_url)
  .slice(0, 10)

if (!results.length) {
  return m.reply('Tidak ada gambar ditemukan.')
}

const rich = new AIRich(conn)
  .setTitle('Pinterest Search')
  .addText(
    'Hasil pencarian untuk: ' + text + '\n' +
    'Total: ' + results.length + ' gambar'
  )

for (const [i, item] of results.entries()) {
  const title =
    item.grid_title ||
    'Pinterest Image ' + (i + 1)

  rich.addImage(item.images_url, {
    id: 'image_' + i
  })

  rich.addText(title, {
    id: 'title_' + i
  })
}

await rich.send(m.chat, {
  quoted: m
})

await m.react('✅')

} catch (e) {
console.error(e)

await m.react('❌')

return m.reply(
  'Gagal mengambil hasil Pinterest: ' +
  (e.message || e)
)

}
}

handler.command = /^(pin2|pinterest2)$/i
handler.help = ['pin2 <query>', 'pinterest2 <query>']
handler.tags = ['search']
handler.register = true
handler.limit = true

export default handler