/**
  *» Nama :* — [ HAIRSTYLE AI ] —
  *» Type :* Plugin - ESM
  *» Base Url :* https://live3d.io
  *» Saluran :* https://whatsapp.com/channel/0029Vb7XfVV2v1IzPVqjgq37
  *» Creator :* -Ɗαnčoᴡ々
**/

import fetch from 'node-fetch'
import FormData from 'form-data'

const CONFIG = {
  baseUrl: 'https://app.live3d.io/aitools',
  resultUrl: 'https://temp.live3d.io',
  origin: 'https://live3d.io',
  originFrom: '5b3e78451640893a',
  fnName: 'demo-change-hair',
  requestFrom: 9
}

function generateHeaders() {
  return {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'fp': '20cebea9c9d06e3b020503f67762edf3',
    'fp1': 'VYuryLPUfU5QZLF53k96BkHdB7IYyJ8VXkNwwNHDooU+n3SlBumb/UiX+PyrVRJv',
    'x-code': Date.now().toString(),
    'x-guide': 'PFu2MqGSK5Wgg3jFZ9VX/LCzTI03jSf6rvUSw8ydSHolxrgCsQrbpZtyycWD/+c4ttuBDSKIYhxAPt4zhxZ4qqyEwjwk6oXmK9Nc04LlwAar9K5Hw2f781SnnuKT/CU0l5PfwaeIIqxXCn3OxyJHKLpPNp6OdkBH952BZ40GETY=',
    'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    'origin': CONFIG.origin,
    'referer': `${CONFIG.origin}/`
  }
}

async function uploadImage(buffer) {
  const form = new FormData()
  form.append('file', buffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  })
  form.append('fn_name', CONFIG.fnName)
  form.append('request_from', String(CONFIG.requestFrom))
  form.append('origin_from', CONFIG.originFrom)

  const res = await fetch(`${CONFIG.baseUrl}/upload-img`, {
    method: 'POST',
    headers: {
      ...generateHeaders(),
      ...form.getHeaders()
    },
    body: form
  })

  return await res.json()
}

async function createTask(imagePath, prompt) {
  const res = await fetch(`${CONFIG.baseUrl}/of/create`, {
    method: 'POST',
    headers: {
      ...generateHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fn_name: CONFIG.fnName,
      call_type: 3,
      input: {
        prompt,
        source_image: imagePath,
        request_from: CONFIG.requestFrom
      },
      request_from: CONFIG.requestFrom,
      origin_from: CONFIG.originFrom
    })
  })

  return await res.json()
}

async function checkStatus(taskId) {
  const res = await fetch(`${CONFIG.baseUrl}/of/check-status`, {
    method: 'POST',
    headers: {
      ...generateHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      task_id: taskId,
      fn_name: CONFIG.fnName,
      call_type: 3,
      request_from: CONFIG.requestFrom,
      origin_from: CONFIG.originFrom
    })
  })

  return await res.json()
}

async function waitForResult(taskId, max = 60) {
  for (let i = 0; i < max; i++) {
    const res = await checkStatus(taskId)

    if (res.code === 200 && res.data?.status === 2 && res.data?.result_image) {
      return res.data.result_image
    }

    if (res.data?.status === -1) {
      throw 'Processing failed'
    }

    await new Promise(r => setTimeout(r, 2000))
  }

  throw 'Timeout'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!mime.startsWith('image/')) {
    return m.reply(
      `Reply image:\n${usedPrefix + command} <prompt>\n\n` +
      `Contoh:\n` +
      `${usedPrefix + command} blue ponytail\n` +
      `${usedPrefix + command} messy bun pink`
    )
  }

  if (!text) return m.reply('Prompt wajib diisi')

  try {
    await m.reply('⏳ Processing...')

    const buffer = await q.download()

    const up = await uploadImage(buffer)
    if (up.code !== 200) throw 'Upload gagal'

    const task = await createTask(up.data.path, text)
    if (task.code !== 200) throw 'Task gagal'

    const result = await waitForResult(task.data.task_id)
    const url = `${CONFIG.resultUrl}/${result}`

    await conn.sendFile(m.chat, url, 'result.webp', '', m)

  } catch (e) {
    m.reply(`❌ ${e}`)
  }
}

handler.help = ['hairstyle <prompt>']
handler.tags = ['ai']
handler.command = ['edithair','hairstyle']

export default handler