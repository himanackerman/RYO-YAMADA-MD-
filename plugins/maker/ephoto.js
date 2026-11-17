import axios from 'axios'
import FormData from 'form-data'
import * as cheerio from 'cheerio'

const EFFECT_URLS = {
  glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
  advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
  typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
  pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
  neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
  flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
  flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
  deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
  blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
  glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
  underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
  logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
  cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
  papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
  watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
  effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
  blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
  gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
  summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
  luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
  multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
  sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
  galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
  '1917style': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
  makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
  royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
  freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
  galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
  amongustext: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
  rainytext: 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html',
  lighteffects: 'https://en.ephoto360.com/light-effects-74.html'
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

async function ephoto(url, textInput) {
  const initialResponse = await axios.get(url, {
    headers: {
      'User-Agent': USER_AGENT
    }
  })

  const $ = cheerio.load(initialResponse.data)
  const token = $('input[name="token"]').val()
  const buildServer = $('input[name="build_server"]').val()
  const buildServerId = $('input[name="build_server_id"]').val()
  const cookies = initialResponse.headers['set-cookie'] || []
  const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ')

  if (!token || !buildServer || !buildServerId) {
    throw new Error('Token atau konfigurasi server tidak ditemukan.')
  }

  const formData = new FormData()
  formData.append('text[]', textInput)
  formData.append('token', token)
  formData.append('build_server', buildServer)
  formData.append('build_server_id', buildServerId)

  const postResponse = await axios.post(url, formData, {
    headers: {
      ...formData.getHeaders(),
      'User-Agent': USER_AGENT,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': cookieHeader,
      'Referer': url
    }
  })

  const $$ = cheerio.load(postResponse.data)
  const rawFormValue = $$('input[name="form_value_input"]').val()

  if (!rawFormValue) {
    throw new Error('Data form hasil tidak ditemukan.')
  }

  const formValueInput = JSON.parse(rawFormValue)
  formValueInput['text[]'] = formValueInput.text
  delete formValueInput.text

  const finalResponse = await axios.post(
    'https://en.ephoto360.com/effect/create-image',
    new URLSearchParams(formValueInput),
    {
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookieHeader,
        'Referer': url,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  if (!finalResponse.data?.image) {
    throw new Error('URL gambar hasil tidak ditemukan.')
  }

  return new URL(finalResponse.data.image, buildServer).href
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  command = command.toLowerCase()

  if (command === 'ephoto') {
    const effectList = [
      'glitchtext',
      'writetext',
      'advancedglow',
      'typographytext',
      'pixelglitch',
      'neonglitch',
      'flagtext',
      'flag3dtext',
      'deletingtext',
      'blackpinkstyle',
      'glowingtext',
      'underwatertext',
      'logomaker',
      'cartoonstyle',
      'papercutstyle',
      'watercolortext',
      'effectclouds',
      'blackpinklogo',
      'gradienttext',
      'summerbeach',
      'luxurygold',
      'multicoloredneon',
      'sandsummer',
      'galaxywallpaper',
      '1917style',
      'makingneon',
      'royaltext',
      'freecreate',
      'galaxystyle',
      'amongustext',
      'rainytext',
      'lighteffects'
    ]

    const effectText = effectList
      .map(effect => `${usedPrefix}${effect} <teks>`)
      .join('\n')

    return m.reply(
      'EPHOTO EFFECTS\n\n' +
      'Daftar efek teks:\n\n' +
      effectText +
      `\n\nContoh: ${usedPrefix}glitchtext Elaina`
    )
  }

  const inputText = text?.trim()

  if (!inputText) {
    throw `Masukkan teks yang ingin dibuat.\nContoh: ${usedPrefix}${command} Elaina`
  }

  const effectUrl = EFFECT_URLS[command]

  if (!effectUrl) {
    throw 'Efek tidak ditemukan.'
  }

  try {
    await m.react('⏳')
    const imageUrl = await ephoto(effectUrl, inputText)

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': USER_AGENT
      }
    })

    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      mimetype: 'image/png'
    }, {
      quoted: m
    })
    await m.react('✅')
  } catch (error) {
    await m.react('❌')
    console.error('Ephoto Error:', error.response?.data || error.message)
    throw 'Gagal membuat efek teks. Silakan coba lagi nanti.'
  }
}

handler.help = [
  'ephoto',
  'glitchtext <teks>',
  'writetext <teks>',
  'advancedglow <teks>',
  'typographytext <teks>',
  'pixelglitch <teks>',
  'neonglitch <teks>',
  'flagtext <teks>',
  'flag3dtext <teks>',
  'deletingtext <teks>',
  'blackpinkstyle <teks>',
  'glowingtext <teks>',
  'underwatertext <teks>',
  'logomaker <teks>',
  'cartoonstyle <teks>',
  'papercutstyle <teks>',
  'watercolortext <teks>',
  'effectclouds <teks>',
  'blackpinklogo <teks>',
  'gradienttext <teks>',
  'summerbeach <teks>',
  'luxurygold <teks>',
  'multicoloredneon <teks>',
  'sandsummer <teks>',
  'galaxywallpaper <teks>',
  '1917style <teks>',
  'makingneon <teks>',
  'royaltext <teks>',
  'freecreate <teks>',
  'galaxystyle <teks>',
  'amongustext <teks>',
  'rainytext <teks>',
  'lighteffects <teks>'
]

handler.tags = ['maker']
handler.command = /^(ephoto|glitchtext|writetext|advancedglow|typographytext|pixelglitch|neonglitch|flagtext|flag3dtext|deletingtext|blackpinkstyle|glowingtext|underwatertext|logomaker|cartoonstyle|papercutstyle|watercolortext|effectclouds|blackpinklogo|gradienttext|summerbeach|luxurygold|multicoloredneon|sandsummer|galaxywallpaper|1917style|makingneon|royaltext|freecreate|galaxystyle|amongustext|rainytext|lighteffects)$/i
handler.limit = true

export default handler
