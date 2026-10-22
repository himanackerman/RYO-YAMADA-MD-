import similarity from 'similarity'

const timeout = 30000
const reward = 5000

let handler = async (m, { conn }) => {
  conn.kuis = conn.kuis ? conn.kuis : {}

  let id = m.chat
  if (id in conn.kuis)
    return m.reply('Masih ada soal belum terjawab di chat ini')

  let random = pickRandom(kuisData)
  let soal = random.soal
  let jawaban = random.jawaban.toLowerCase()

  let msg = await m.reply(`「 KUIS 」\n\n${soal}\n\n⏳ Waktu: 30 detik\n💎 Bonus: ${reward} XP\nKetik *nyerah* untuk menyerah`)

  conn.kuis[id] = [
    msg,
    { soal, jawaban },
    setTimeout(() => {
      if (conn.kuis[id]) {
        m.reply(`⏰ Waktu habis!\nJawaban: *${jawaban}*`)
        delete conn.kuis[id]
      }
    }, timeout)
  ]
}

handler.help = ['kuis']
handler.tags = ['game']
handler.command = /^kuis$/i

export default handler

handler.before = async function (m, { conn }) {
  if (m.fromMe || m.isBaileys) return
  conn.kuis = conn.kuis ? conn.kuis : {}
  let id = m.chat
  if (!(id in conn.kuis)) return

  if (!m.text) return

  let teks = m.text.toLowerCase().trim()
  let [msg, data, time] = conn.kuis[id]

  if (/^((me)?nyerah|surr?ender)$/i.test(teks)) {
    clearTimeout(time)
    m.reply(`🏳️ Menyerah!\nJawaban: *${data.jawaban}*`)
    delete conn.kuis[id]
    return true
  }

  if (similarity(teks, data.jawaban) >= 0.9) {
    clearTimeout(time)
    global.db.data.users[m.sender].exp += reward
    m.reply(`✅ Benar!\n+${reward} XP`)
    delete conn.kuis[id]
    return true
  }

  if (similarity(teks, data.jawaban) >= 0.7) {
    m.reply('🤏 Dikit lagi!')
    return true
  }

  return true
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const kuisData = [
  { soal: 'Pemain bola apa yang beratnya 3 kg?', jawaban: 'bola basket' },
  { soal: 'Kenapa di rel kereta api ditaruh batu?', jawaban: 'agar stabil' },
  { soal: 'Apa warna angin?', jawaban: 'tidak berwarna' },
  { soal: 'Mana yang lebih berat, kapas 100 kg atau besi 100 kg?', jawaban: 'sama' },
  { soal: 'Mengapa motor berhenti di lampu merah?', jawaban: 'karena lampu merah' },
  { soal: 'Kunci apa yang bisa bikin orang joget?', jawaban: 'kunci gitar' },
  { soal: 'Benda kecil apa yang bisa ngeluarin orang?', jawaban: 'peluru' },
  { soal: 'Malam apa yang paling mengerikan?', jawaban: 'malam minggu sendiri' },
  { soal: 'Ayam apa yang bikin sebel?', jawaban: 'ayam tetangga' },
  { soal: 'Kenapa di komputer ada tulisan enter?', jawaban: 'untuk masuk' },
  { soal: 'Apa persamaan uang dan rahasia?', jawaban: 'sama-sama sulit dijaga' },
  { soal: 'Apa bedanya kamu dan lukisan?', jawaban: 'lukisan diam kamu tidak' },
  { soal: 'Bis apa yang paling membahagiakan?', jawaban: 'bisa bersamamu' },
  { soal: 'Setan apa yang paling romantis?', jawaban: 'setan yang setia' },
  { soal: 'Kopi apa yang paling pahit?', jawaban: 'kopi kehidupan' },
  { soal: 'Rel apa yang paling sakit?', jawaban: 'rel hati' },
  { soal: 'Tiang apa yang enak?', jawaban: 'tiang listrik goreng' },
  { soal: 'Susu apa yang indah?', jawaban: 'susuah dilupakan' },
  { soal: 'Buah apa yang paling kaya?', jawaban: 'sawo matang' },
  { soal: 'Apa itu cemilan?', jawaban: 'cewe imut menawan' },
  { soal: 'Telur sama ayam duluan mana?', jawaban: 'telur' },
  { soal: 'Tentara apa yang paling kecil?', jawaban: 'tentara semut' },
  { soal: 'Lemari yang bisa masuk kantong?', jawaban: 'lemari es mini' },
  { soal: 'Bebek apa yang jalannya muter terus?', jawaban: 'bebek nyasar' },
  { soal: 'Ditutup jadi tongkat dibuka jadi tenda?', jawaban: 'payung' },
  { soal: 'Orang apa yang berenang tapi rambutnya tidak basah?', jawaban: 'orang botak' },
  { soal: 'Apa huruf kelima dalam abjad?', jawaban: 'e' },
  { soal: 'Pesawat jatuh kapal tenggelam munculnya dimana?', jawaban: 'di berita' },
  { soal: 'Apa yang ada di tengah sawah?', jawaban: 'w' },
]