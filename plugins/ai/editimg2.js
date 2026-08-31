import axios from 'axios'
import crypto from 'crypto'
import FormData from 'form-data'

async function live3d(buffer, prompt) {
  const config = {
    pkey: "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDd2xPK2JvQzZjd1JvM1VmWFZCYWRhWXdjWDB6S1MyZnVWTlkycVowZGd3YjFOSisvUTlGZUFvc0w0T05pb3NENzFvbjNQVllxUlVsTDUwNDVtdkgySzlpOGJBRlZNRWlwN0U2Uk1LNnRLQUFpZjd4elpyWG5QMUdaNVJpanRxZGd3aCtZbXpUbzM5Y3VCQ3NacUs5b0VvZVEzci9teUc5Uys5Y1I1aHVUdUZRSURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==",
    aid: "aifaceswap",
    uid: "1H5tRtzsBkqXcaJ",
    origin: "8f3f0c7387123ae0",
    theme_version: '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    model: 'nano_banana_2',
  }

  let currentFp = crypto.randomBytes(16).toString('hex')

  const crypt = {
    aes: (data, key) => {
      const cipher = crypto.createCipheriv('aes-128-cbc', key, key)
      return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64')
    },
    rsa: (data) => {
      return crypto.publicEncrypt({
        key: Buffer.from(config.pkey, "base64").toString(),
        padding: crypto.constants.RSA_PKCS1_PADDING,
      }, Buffer.from(data, 'utf8')).toString('base64')
    }
  }

  const api = axios.create({
    baseURL: 'https://app-v1.live3d.io',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
      'origin': 'https://live3d.io',
      'referer': 'https://live3d.io/',
      'theme-version': config.theme_version
    }
  })

  api.interceptors.request.use((cfg) => {
    const [i, d, n] = [
      crypto.randomBytes(8).toString('hex'),
      crypto.randomUUID(),
      Math.floor(Date.now() / 1000)
    ]
    const s = crypt.rsa(i)
    const signStr = cfg.url.includes('upload-img')
      ? `${config.aid}:${d}:${s}`
      : `${config.aid}:${config.uid}:${n}:${d}:${s}`
    Object.assign(cfg.headers, {
      'fp': currentFp,
      'fp1': crypt.aes(`${config.aid}:${currentFp}`, i),
      'x-guide': s,
      'x-sign': crypt.aes(signStr, i),
      'x-code': Date.now().toString()
    })
    return cfg
  })

  const form = new FormData()
  form.append('file', buffer, { filename: 'input.jpg', contentType: 'image/jpeg' })
  form.append('fn_name', 'demo-image-editor')
  form.append('request_from', '9')
  form.append('origin_from', config.origin)

  const { data: upRes } = await api.post('/aitools/upload-img', form, {
    headers: form.getHeaders()
  })

  const { data: job } = await api.post('/aitools/of/create', {
    fn_name: 'demo-image-editor',
    call_type: 3,
    input: {
      model: config.model,
      source_images: [upRes.data.path],
      prompt,
      aspect_radio: 'auto',
      request_from: 9
    },
    data: '',
    request_from: 9,
    origin_from: config.origin
  })

  const taskId = job.data.task_id
  if (!taskId) throw new Error('TaskId cannot be found')

  while (true) {
    const { data: status } = await api.post('/aitools/of/check-status', {
      task_id: taskId,
      fn_name: 'demo-image-editor',
      call_type: 3,
      request_from: 9,
      origin_from: config.origin
    })
    if (status.data.status === 2) return 'https://temp.live3d.io/' + status.data.result_image
    if (status.data.status === 3) throw new Error('Task failed')
    await new Promise(r => setTimeout(r, 3000))
  }
}

let handler = async (m, { conn, text }) => {
  try {
    const q    = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) return m.reply('Mana gambarnya')
    if (!text) return m.reply('Promptnya mana?')
    await m.react('⏳').catch(() => {})

    const url = await live3d(await q.download(), text)
    const tgl = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })

    await conn.sendMessage(m.chat, {
      image: { url },
      caption:
        '⌯  *E D I T · I M A G E*\n\n'
        + '     ▸    *Prompt*: ' + text + '\n\n'
        + '     ▸    *Request by*: ' + m.pushName + '\n\n'
        + '                 © Cecilia ––\ ' + tgl
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    await m.react('❌').catch(() => {})
    m.reply('Gagal: ' + e.message)
  }
}

handler.help    = ['editimg2 <prompt>']
handler.tags    = ['ai']
handler.command = /^editimg2$/i

export default handler