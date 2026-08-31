import { Akinator } from '@aqul/akinator-api'

if (!global.akinatorSessions) global.akinatorSessions = {}

const ANSWERS = {
  '1': 0, 'ya': 0, 'yes': 0,
  '2': 1, 'tidak': 1, 'no': 1,
  '3': 2, 'tidak tahu': 2, 'idk': 2,
  '4': 3, 'mungkin': 3,
  '5': 4, 'mungkin tidak': 4,
  '0': 'back', 'kembali': 'back'
}

const buildQuestion = (aki) =>
  `*🧞 AKINATOR*\n\n❓ *Pertanyaan ${aki.step + 1}:*\n${aki.question}\n\n📊 Progress: ${Math.round(aki.progress)}%\n\n*Jawab:*\n1️⃣ Ya\n2️⃣ Tidak\n3️⃣ Tidak Tahu\n4️⃣ Mungkin\n5️⃣ Mungkin Tidak\n0️⃣ Kembali\n\n> Ketik *.akistop* untuk berhenti`

let handler = async (m, { conn, command }) => {
  const id = m.sender

  if (/^akistop$/i.test(command)) {
    if (!global.akinatorSessions[id]) return m.reply('Tidak ada game Akinator yang aktif.')
    delete global.akinatorSessions[id]
    return m.reply('Game Akinator dihentikan! 👋')
  }

  if (global.akinatorSessions[id]) return m.reply('Masih ada game Akinator aktif!\nKetik *.akistop* untuk berhenti.')

  try {
    await m.reply('```Memulai Akinator...```')
    const aki = new Akinator({ region: 'id', childMode: true })
    await aki.start()
    global.akinatorSessions[id] = aki
    await conn.sendMessage(m.chat, { text: buildQuestion(aki) }, { quoted: m })
  } catch (e) {
    delete global.akinatorSessions[id]
    m.reply('Gagal memulai Akinator: ' + e.message)
  }
}

handler.before = async function (m) {
  if (m.fromMe || m.isBaileys) return
  const id = m.sender
  const aki = global.akinatorSessions[id]
  if (!aki) return

  const input = m.text?.toLowerCase().trim()
  const answer = ANSWERS[input]
  if (answer === undefined) return

  try {
    if (answer === 'back') {
      if (aki.step === 0) return m.reply('Tidak bisa kembali lagi.')
      await aki.cancelAnswer()
    } else {
      await aki.answer(answer)
    }

    if (aki.isWin) {
      delete global.akinatorSessions[id]
      return await this.sendMessage(m.chat, {
        image: { url: aki.sugestion_photo },
        caption: `*🧞 Akinator menebak...*\n\n👤 *${aki.sugestion_name}*\n📝 ${aki.sugestion_desc}\n\n_Benar tidak? 😄_`
      }, { quoted: m })
    }

    await this.sendMessage(m.chat, { text: buildQuestion(aki) }, { quoted: m })
  } catch (e) {
    delete global.akinatorSessions[id]
    m.reply('Terjadi kesalahan: ' + e.message)
  }
}

handler.help = ['akinator', 'aki']
handler.tags = ['game']
handler.command = /^(akinator|aki|akistop)$/i

export default handler