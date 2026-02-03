import axios from "axios"

const modes = {
  noob: [-3, 3, -3, 3, "+-", 15000, 10],
  easy: [-10, 10, -10, 10, "*/+-", 20000, 40],
  medium: [-40, 40, -20, 20, "*/+-", 40000, 150],
  hard: [-100, 100, -70, 70, "*/+-", 60000, 350],
  extreme: [-999999, 999999, -999999, 999999, "*/", 99999, 9999],
  impossible: [-99999999999, 99999999999, -99999999999, 999999999999, "*/", 30000, 35000],
  impossible2: [-999999999999999, 999999999999999, -999, 999, "/", 30000, 50000],
  impossible3: [-999999999999999999, 999999999999999999, -999999999999999999, 999999999999999999, "*/", 100000, 100000],
  impossible4: [-999999999999999999999, 999999999999999999999, -999999999999999999999, 999999999999999999999, "*/", 500000, 500000],
  impossible5: [-999999999999999999999999, 999999999999999999999999, -999999999999999999999999, 999999999999999999999999, "*/", 1000000, 1000000]
}

const operators = {
  "+": "+",
  "-": "-",
  "*": "×",
  "/": "÷"
}

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from]
  from = Math.floor(from)
  to = Math.floor(to)
  return Math.floor((to - from) * Math.random() + from)
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function generateMath(level) {
  const [a1, a2, b1, b2, ops] = modes[level]
  let a = randomInt(a1, a2)
  let b = randomInt(b1, b2)
  const op = pickRandom([...ops])
  let result

  if (op === "/") {
    while (b === 0) b = randomInt(b1, b2)
    result = a
    a = result * b
  } else {
    result = new Function(`return ${a} ${op.replace("/", "*")} ${b < 0 ? `(${b})` : b}`)()
  }

  return {
    str: `${a} ${operators[op]} ${b}`,
    answer: result
  }
}

let handler = async (m, { conn, text }) => {
  const level = text && modes[text] ? text : pickRandom(Object.keys(modes))

  global.maths = global.maths || {}
  const chat = m.chat

  const data = await generateMath(level)

  await conn.reply(
    chat,
    `➗ *TEBAK MATEMATIKA*\n\nMode: *${level.toUpperCase()}*\nSoal:\n👉 *${data.str}*\n\n⏳ Waktu: *60 detik*\nKirim jawabannya langsung.`,
    m
  )

  global.maths[chat] = {
    answer: Number(data.answer),
    player: m.sender,
    timer: setTimeout(() => {
      conn.reply(chat, `❌ Waktu habis!\nJawaban: *${data.answer}*`)
      delete global.maths[chat]
    }, 60000)
  }
}

handler.command = /^maths$/i
handler.tags = ["game"]
handler.help = ["maths"]
handler.limit = false

// Auto-check jawaban
handler.all = async function (m) {
  global.maths = global.maths || {}
  const room = global.maths[m.chat]
  if (!room?.answer) return

  const t = (m.text || "").trim()

  if (!/^-?\d+$/i.test(t)) return

  if (Number(t) === Number(room.answer)) {
    clearTimeout(room.timer)
    this.reply(
      m.chat,
      `✅ Benar! 🎉\nJawaban: *${room.answer}*`,
      m
    )
    delete global.maths[m.chat]
  }
}

export default handler