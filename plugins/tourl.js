import { fileTypeFromBuffer } from 'file-type'
import FormData from 'form-data'
import fetch from 'node-fetch'

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

async function uploadTmpfiles(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()
  form.append('file', buffer, `upload-${Date.now()}.${ext || 'bin'}`)

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form,
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const json = await res.json()
  const match = /https?:\/\/tmpfiles\.org\/(.*)/.exec(json?.data?.url)
  if (!match) throw 'Tmpfiles gagal'

  return `https://tmpfiles.org/dl/${match[1]}`
}

async function uploadCatbox(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)

  const res = await fetchWithTimeout(
    'https://catbox.moe/user/api.php',
    { method: 'POST', body: form },
    5000
  )

  const text = (await res.text()).trim()
  if (!text.startsWith('https://')) throw 'Catbox down'

  return text
}

let handler = async (m, { conn }) => {
  let q = m.quoted || m
  let buffer = await q.download().catch(() => null)
  if (!buffer) return

  let mime = (await fileTypeFromBuffer(buffer))?.mime || '-'

  let tmp = '❌'
  let catbox = '❌ (server down)'

  try { tmp = await uploadTmpfiles(buffer) } catch {}
  try { catbox = await uploadCatbox(buffer) } catch {}

  const text = [
    '✅ *Upload selesai*',
    '——————',
    `📂 *Mime:* ${mime}`,
    '',
    `☁️ Tmpfiles : ${tmp}`,
    `⏳ Status   : *Expired (sementara)*`,
    '',
    `📦 Catbox   : ${catbox}`,
    `♾️ Status   : *Non-expired*`,
    '——————',
    '📢 Pilih link sesuai kebutuhan'
  ].join('\n')

  await conn.sendMessage(
    m.chat,
    { text },
    { quoted: global.fkontak }
  )
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^tourl$/i
handler.limit = false

export default handler