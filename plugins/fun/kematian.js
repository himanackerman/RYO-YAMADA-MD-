function getRandomDate() {
  const now = new Date()
  const future = new Date(now.getFullYear() + 70, 0, 1)
  const deathTime = new Date(now.getTime() + Math.random() * (future.getTime() - now.getTime()))
  return deathTime.toDateString()
}

let handler = async (m, { text }) => {
  const nama = text || m.pushName || 'Kamu'

  const sebab = [
    'keracunan cilok expired 😵',
    'ditabrak mobil odading 😩',
    'terpeleset di kamar mandi pas nyanyi dangdut 🚿🎤',
    'kecanduan scrolling TikTok 48 jam nonstop 📱💀',
    'ngambek sama bot sendiri terus putus asa 😭',
    'kelamaan jomblo sampe badan menghilang 🫥',
    'makan mie pakai kopi dan susu 🤢',
    'diculik alien terus dikira bahan eksperimen 👽🔬',
    'dipukul karma karena suka nyolong meme 🙃',
    'ketawa ngakak sampai lupa napas 😂'
  ]

  let tanggal = getRandomDate()
  let penyebab = sebab[Math.floor(Math.random() * sebab.length)]

  m.reply(`*\`Ramalan Kematian\`*\n\n✿ Nama : ${nama}\n✿ Tanggal : ${tanggal}\n✿ Penyebab : ${penyebab}`)
}

handler.help = ['kematian <nama opsional>']
handler.tags = ['fun']
handler.command = /^kematian$/i
handler.limit = false

export default handler