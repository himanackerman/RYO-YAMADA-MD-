import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'

let handler = async (m, { conn, args, command, usedPrefix, text }) => {
  if (command === 'voiceondoku') {
    const res = await axios.get('https://raw.githubusercontent.com/rynn-k/idk/refs/heads/main/json/ondoku-voice.json')
    const voices = res.data
    if (!Array.isArray(voices)) throw 'Gagal mengambil daftar voice'

    const grouped = voices.reduce((acc, v) => {
      const lang = v.split('-')[0]
      acc[lang] = acc[lang] || []
      acc[lang].push(v)
      return acc
    }, {})

    let out = '📢 *Daftar Voice Ondoku*\n\n'
    for (const lang in grouped) {
      out += `🌐 *${lang.toUpperCase()}*\n` + grouped[lang].map(v => `• ${v}`).join('\n') + '\n\n'
    }

    return await conn.reply(m.chat, out.trim(), m)
  }

  // Perintah utama `.ondoku`
  if (!text) throw `Contoh:\n${usedPrefix + command} id-ID-ArdiNeural|halo semua\nAtau:\n${usedPrefix + command} halo semua
  list tts lainya ketik .voiceonduku`

  let [voiceRaw, ...txt] = text.split('|')
  let voice = 'id-ID-ArdiNeural'
  let speakText = text

  // Jika format voice|text digunakan
  if (txt.length) {
    voice = voiceRaw.trim()
    speakText = txt.join('|').trim()
  }

  const audio = await ondoku(speakText, {
    voice,
    speed: 1,
    pitch: 0
  })

  if (!audio || !audio.url) throw 'Gagal menghasilkan audio'

  await conn.sendFile(m.chat, audio.url, 'tts.mp3', null, m, true, {
    type: 'audioMessage',
    ptt: true
  })
}

handler.help = ['ondoku <voice|text>', 'voiceondoku']
handler.tags = ['tools']
handler.command = /^ondoku|voiceondoku$/i
handler.limit = true
export default handler

async function ondoku(text, { voice = 'en-US-AdamMultilingualNeural', speed = 1, pitch = 0 } = {}) {
  if (!text) throw new Error('Teks tidak boleh kosong')

  const { data: voices } = await axios.get('https://raw.githubusercontent.com/rynn-k/idk/refs/heads/main/json/ondoku-voice.json')
  if (!voices.includes(voice)) throw new Error(`Voice tidak ditemukan.\nGunakan *.voiceondoku* untuk melihat daftar voice.`)
  if (speed < 0.3 || speed > 4) throw new Error('Speed minimum 0.3 dan maksimum 4')
  if (pitch < -20 || pitch > 20) throw new Error('Pitch minimum -20 dan maksimum 20')

  const rynn = await axios.post('https://ondoku3.com/en')
  const $ = cheerio.load(rynn.data)
  const token = $('input[name="csrfmiddlewaretoken"]').attr('value')

  const form = new FormData()
  form.append('text', text)
  form.append('voice', voice)
  form.append('speed', speed.toString())
  form.append('pitch', pitch.toString())

  const { data } = await axios.post('https://ondoku3.com/en/text_to_speech/', form, {
    headers: {
      cookie: rynn.headers['set-cookie'].join('; '),
      origin: 'https://ondoku3.com',
      referer: 'https://ondoku3.com/en/',
      'x-csrftoken': token,
      'x-requested-with': 'XMLHttpRequest',
      ...form.getHeaders()
    }
  })

  return data
}