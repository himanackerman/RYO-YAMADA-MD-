import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function uploadVidey(file) {
  if (!file) throw new Error('input required')
  if (!fs.existsSync(file)) throw new Error('file not found')

  const form = new FormData()
  form.append('file', fs.createReadStream(file), {
    filename: path.basename(file),
    contentType: 'video/mp4'
  })

  const res = await axios.post(
    'https://videy.co/api/upload?visitorId=' + crypto.randomUUID(),
    form,
    {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'Mozilla/5.0',
        origin: 'https://videy.co',
        referer: 'https://videy.co/',
        accept: 'application/json'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  )

  return res.data
}