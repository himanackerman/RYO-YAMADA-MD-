// Reference: akinator.js by IzzXd

import * as cheerio from 'cheerio'
import { gotScraping } from 'got-scraping'

const BASE_URL = 'https://id.akinator.com'
const THEMES = { characters: 1, animals: 14, objects: 2 }
const ANSWERS = { yes: 0, no: 1, idk: 2, probably: 3, 'probably not': 4 }

function parseCookies(setCookieHeader, jar) {
  if (!setCookieHeader) return
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
  for (const c of cookies) {
    const [kv] = c.split(';')
    const i = kv.indexOf('=')
    if (i > 0) jar[kv.slice(0, i).trim()] = kv.slice(i + 1).trim()
  }
}

const cookieStr = jar => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ')

async function post(jar, path, form) {
  const res = await gotScraping({
    url: BASE_URL + path,
    method: 'POST',
    form,
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      origin: BASE_URL,
      referer: BASE_URL + '/game',
      ...(Object.keys(jar).length ? { cookie: cookieStr(jar) } : {})
    },
    throwHttpErrors: false
  })
  parseCookies(res.headers['set-cookie'], jar)
  return res
}

function parseJSON(body) {
  try { return JSON.parse(body) } catch { throw new Error('Gagal parse response akinator: ' + String(body).slice(0, 200)) }
}

async function startAki(theme = 'characters', childMode = true) {
  try {
    const jar = {}
    const sid = THEMES[theme] ?? THEMES.characters

    const home = await gotScraping({ url: BASE_URL + '/', throwHttpErrors: false })
    parseCookies(home.headers['set-cookie'], jar)

    const res = await post(jar, '/game', { sid: String(sid), cm: String(childMode) })
    const body = res.body
    const $ = cheerio.load(body)

    const session =
      body.match(/session:\s*'([^']+)'/)?.[1] ||
      body.match(/localStorage\.setItem\('session',\s*'([^']+)'\)/)?.[1] ||
      body.match(/name="session"[^>]*value="([^"]+)"/)?.[1]

    const identifiant =
      body.match(/localStorage\.setItem\('identifiant',\s*'([^']+)'\)/)?.[1] ||
      body.match(/name="identifiant"[^>]*value="([^"]+)"/)?.[1] ||
      ''

    const question = $('#question-label').text().trim()

    if (!session || !question) {
      return { status: false, error: 'Gagal extract session/pertanyaan dari halaman akinator' }
    }

    const step = parseInt(body.match(/localStorage\.setItem\('step',\s*'(\d+)'\)/)?.[1] || '0')

    return {
      status: true,
      jar,
      sid,
      session,
      identifiant,
      question,
      step,
      progression: 0,
      stepLastProposition: '',
      num: 1
    }
  } catch (e) {
    return { status: false, error: e.message }
  }
}

function handleResponse(data, state) {
  if (data.completion === 'KO') return { status: false, error: 'Sesi Akinator kedaluwarsa, mulai ulang game.' }
  if (data.completion === 'SOUNDLIKE') return { status: true, lost: true }

  if (data.id_proposition) {
    state.step = parseInt(data.step ?? state.step)
    state.stepLastProposition = String(state.step)
    return {
      status: true,
      guess: {
        id: data.id_proposition,
        id_base: data.id_base_proposition,
        name: data.name_proposition,
        description: data.description_proposition,
        photo: data.photo,
        pseudo: data.pseudo
      }
    }
  }

  if (data.question) state.question = data.question
  if (data.step !== undefined) state.step = parseInt(data.step)
  if (data.progression !== undefined) state.progression = parseFloat(data.progression)
  return { status: true }
}

async function answerAki(state, id) {
  try {
    const answerId = typeof id === 'number' ? id : (ANSWERS[String(id).toLowerCase()] ?? -1)
    if (answerId === -1) return { status: false, error: `Jawaban tidak valid: "${id}"` }

    const res = await post(state.jar, '/answer', {
      step: String(state.step),
      progression: String(state.progression),
      sid: String(state.sid),
      cm: 'false',
      answer: String(answerId),
      step_last_proposition: state.stepLastProposition,
      session: state.session
    })
    const r = handleResponse(parseJSON(res.body), state)
    if (r.status && !r.guess && !r.lost) state.num = (state.num || 1) + 1
    return r
  } catch (e) {
    return { status: false, error: e.message }
  }
}

async function backAki(state) {
  try {
    const res = await post(state.jar, '/cancel_answer', {
      step: String(state.step),
      progression: String(state.progression),
      sid: String(state.sid),
      cm: 'false',
      session: state.session
    })
    const r = handleResponse(parseJSON(res.body), state)
    if (r.status) state.num = Math.max(1, (state.num || 1) - 1)
    return r
  } catch (e) {
    return { status: false, error: e.message }
  }
}

if (!global.akinatorSessions) global.akinatorSessions = {}

const ANSWERS_MAP = {
  '1': 'yes', 'ya': 'yes', 'yes': 'yes',
  '2': 'no', 'tidak': 'no', 'no': 'no',
  '3': 'idk', 'tidak tahu': 'idk', 'idk': 'idk',
  '4': 'probably', 'mungkin': 'probably',
  '5': 'probably not', 'mungkin tidak': 'probably not',
  '0': 'back', 'kembali': 'back'
}

const buildQuestion = (state) =>
  `*🧞 AKINATOR*\n\n❓ *Pertanyaan ${state.step + 1}:*\n${state.question}\n\n📊 Progress: ${Math.round(state.progression || 0)}%\n\n*Jawab:*\n1️⃣ Ya\n2️⃣ Tidak\n3️⃣ Tidak Tahu\n4️⃣ Mungkin\n5️⃣ Mungkin Tidak\n0️⃣ Kembali\n\n> Ketik *.akistop* untuk berhenti`

let handler = async (m, { conn, command }) => {
  const id = m.sender

  if (/^akistop$/i.test(command)) {
    if (!global.akinatorSessions[id]) {
      await m.react('❌')
      return m.reply('Tidak ada game Akinator yang aktif.')
    }
    delete global.akinatorSessions[id]
    await m.react('✨')
    return m.reply('Game Akinator dihentikan! 👋')
  }

  if (global.akinatorSessions[id]) {
    await m.react('❌')
    return m.reply('Masih ada game Akinator aktif!\nKetik *.akistop* untuk berhenti.')
  }

  try {
    await m.react('🕒')
    const state = await startAki('characters', true)
    
    if (!state.status) {
      await m.react('❌')
      return m.reply('Gagal memulai Akinator: ' + (state.error || 'Unknown error'))
    }

    global.akinatorSessions[id] = state
    await m.react('✨')
    await conn.sendMessage(m.chat, { text: buildQuestion(state) }, { quoted: m })
  } catch (e) {
    delete global.akinatorSessions[id]
    await m.react('❌')
    m.reply('Gagal memulai Akinator: ' + e.message)
  }
}

handler.before = async function (m) {
  if (m.fromMe || m.isBaileys) return
  const id = m.sender
  const state = global.akinatorSessions[id]
  if (!state) return

  const input = m.text?.toLowerCase().trim()
  const ansKey = ANSWERS_MAP[input]
  if (!ansKey) return

  try {
    await m.react('🕒')
    let res

    if (ansKey === 'back') {
      if (state.step === 0) {
        await m.react('❌')
        return m.reply('Tidak bisa kembali ke pertanyaan awal.')
      }
      res = await backAki(state)
    } else {
      res = await answerAki(state, ansKey)
    }

    if (!res.status) {
      delete global.akinatorSessions[id]
      await m.react('❌')
      return m.reply('Sesi Akinator berakhir atau terjadi kesalahan: ' + (res.error || ''))
    }

    if (res.lost) {
      delete global.akinatorSessions[id]
      await m.react('❌')
      return m.reply('Akinator menyerah! Karakter yang kamu pikirkan terlalu sulit. 😅')
    }

    if (res.guess) {
      delete global.akinatorSessions[id]
      await m.react('✨')
      return await this.sendMessage(m.chat, {
        image: { url: res.guess.photo },
        caption: `*🧞 Akinator menebak...*\n\n👤 *${res.guess.name}*\n📝 ${res.guess.description}\n\n_Benar tidak? 😄_`
      }, { quoted: m })
    }

    await m.react('✨')
    await this.sendMessage(m.chat, { text: buildQuestion(state) }, { quoted: m })
  } catch (e) {
    delete global.akinatorSessions[id]
    await m.react('❌')
    m.reply('Terjadi kesalahan: ' + e.message)
  }
}

handler.help = ['akinator', 'aki', 'akistop']
handler.tags = ['game']
handler.command = /^(akinator|aki|akistop)$/i

export default handler