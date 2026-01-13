/*
- Name : Cerdas Cermat Anak SD
- Deks : Ha
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Yang Punya Anunya : https://whatsapp.com/channel/0029Vaq9pCUEawdzlDYdYF3p/1118
*/
import axios from 'axios'

const subjects = [
  'bindo', 'tik', 'pkn', 'bing', 'penjas',
  'pai', 'matematika', 'jawa', 'ips', 'ipa'
]

const motivationalPhrases = {
  0: 'Waduh, kamu perlu belajar lebih giat lagi!',
  1: 'Masih perlu banyak belajar nih!',
  2: 'Lumayan, tapi bisa lebih baik!',
  3: 'Bagus, pertahankan!',
  4: 'Hampir setengah benar, semangat!',
  5: 'Sudah setengah jalan! Tingkatkan lagi!',
  6: 'Lumayan bagus!',
  7: 'Bagus sekali!',
  8: 'Hampir sempurna!',
  9: 'Hampir sempurna! Tinggal sedikit lagi!',
  10: 'Sempurna! Kamu benar-benar menguasai materi ini!'
}

let handler = async (m, { conn, args, command }) => {
  conn.cerdasCermat = conn.cerdasCermat || {}
  
  if (conn.cerdasCermat[m.sender]) return m.reply('Kamu Lagi Main Cerdas Cermat Selesaikan Dlu Soal Nya')
  
  const [matapelajaran, jumlahSoal] = args.map(arg => arg.toLowerCase())
  
  if (!subjects.includes(matapelajaran)) return m.reply(`Pilih Mata Pelajaran Sama Jumlah Soal\n\n*Mata Pelajaran Yang Ada*\n- ips\n- ipa\n- bindo\n- pai\n- jawa\n- bing\n- penjas\n- matematika\n- tik\n- pkn\n\n*Jumlah Soal Minimal 5 Maximal 10*\n\n*Example :* .cc ipa 5`)
  
  const soalCount = parseInt(jumlahSoal)
  if (isNaN(soalCount)) return m.reply('Jumlah soal harus angka!')
  if (soalCount < 5 || soalCount > 10) return m.reply('Jumlah soal harus antara 5-10!')
  
  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/games/cc-sd?matapelajaran=${matapelajaran}&jumlahsoal=${soalCount}`)
    
    conn.cerdasCermat[m.sender] = {
      questions: data.data.soal,
      currentQuestion: 0,
      correctAnswers: 0,
      startTime: Date.now(),
      answered: false
    }
    
    await sendQuestion(conn, m)
    
  } catch (error) {
    console.error(error)
    m.reply('Error :>')
  }
}

handler.command = ['cerdascermat', 'cc']
handler.tags = ['game', 'education']
handler.help = ['cerdascermat <matapelajaran> <jumlahsoal>', 'cc <matapelajaran> <jumlahsoal>']
handler.example = ['cerdascermat matematika 5', 'cc ipa 7']

handler.before = async (m, { conn }) => {
  if (!m.text || m.isBaileys || m.fromMe) return
  
  conn.cerdasCermat = conn.cerdasCermat || {}
  const session = conn.cerdasCermat[m.sender]
  if (!session) return
  
  const isReply = m.quoted && m.quoted.id === session.lastQuestionId
  
  if (!isReply && !session.answered) return m.reply('Silakan jawab soal sebelumnya dengan mereply pesan bot!')
  
  session.answered = true
  
  const userAnswer = m.text.trim().toLowerCase()
  const currentQuestion = session.questions[session.currentQuestion]
  const correctAnswer = currentQuestion.jawaban_benar.toLowerCase()
  
  const options = currentQuestion.semua_jawaban.map(j => Object.keys(j)[0].toLowerCase())
  if (!options.includes(userAnswer)) return m.reply(`Jawaban tidak valid. Pilih salah satu dari: ${options.join(', ')}`)
  
  if (userAnswer === correctAnswer) {
    session.correctAnswers++
    await m.reply('Jawaban benar!')
  } else {
    await m.reply(`Jawaban salah! Yang benar adalah ${correctAnswer.toUpperCase()}`)
  }
  
  session.currentQuestion++
  
  if (session.currentQuestion < session.questions.length) {
    await sendQuestion(conn, m)
    session.answered = false
  } else {
    const totalQuestions = session.questions.length
    const score = session.correctAnswers
    const percentage = Math.round((score / totalQuestions) * 100)
    const phraseKey = Math.min(score, 10)
    
    await m.reply(`
Hasil Cerdas Cermat
    
Jawaban benar: ${score}/${totalQuestions}
Nilai: ${percentage}%
    
${motivationalPhrases[phraseKey]}
    `.trim())
    
    delete conn.cerdasCermat[m.sender]
  }
}

async function sendQuestion(conn, m) {
  const session = conn.cerdasCermat[m.sender]
  const questionData = session.questions[session.currentQuestion]
  
  let questionText = `Soal ${session.currentQuestion + 1}/${session.questions.length}\n\n${questionData.pertanyaan}\n\n`
  questionData.semua_jawaban.forEach(option => {
    const [key, value] = Object.entries(option)[0]
    questionText += `${key.toUpperCase()}. ${value}\n`
  })
  
  const sentMsg = await conn.sendMessage(m.chat, {
    text: questionText + '\nReply Pesan Ini Jawab Opsi Yang Ada Ya [ A,B,C,D ]',
    replyTo: m.id
  })
  
  session.lastQuestionId = sentMsg.key.id
}

export default handler