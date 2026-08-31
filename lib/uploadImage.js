import fetch from 'node-fetch'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

async function uploadImage(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}

  const form = new FormData()
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)
  form.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })

  return await res.text()
}

async function uploadFile(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()

  form.append(
    'file',
    buffer,
    `upload-${Date.now()}.${ext || 'bin'}`
  )

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

  if (!match) throw new Error('Tmpfiles upload gagal')

  return `https://tmpfiles.org/dl/${match[1]}`
}

const uploadPomf = uploadFile

export default uploadImage
export { uploadFile, uploadPomf }