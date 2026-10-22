import fetch from 'node-fetch'
import FormData from 'form-data'

export async function pixelcutRemove(buffer) {
  let form = new FormData()
  form.append('image', buffer, 'image.jpg')
  form.append('format', 'png')
  form.append('model', 'v1')

  let res = await fetch('https://api2.pixelcut.app/image/matte/v1', {
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile)',
      'Accept': 'application/json, text/plain, */*',
      'x-client-version': 'web:pixa.com:4a5b0af2',
      'x-locale': 'en',
      'origin': 'https://www.pixa.com',
      'referer': 'https://www.pixa.com/',
    },
    body: form
  })

  if (!res.ok) throw new Error(await res.text())

  return Buffer.from(await res.arrayBuffer())
}


export async function removalAi(buffer) {
  let tokenRes = await fetch('https://removal.ai/wp-admin/admin-ajax.php?action=ajax_get_webtoken&security=d82109f663', {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })

  let token = (await tokenRes.json()).data.webtoken

  let form = new FormData()
  form.append('image_file', buffer, 'image.jpg')

  let res = await fetch('https://api.removal.ai/3.0/remove', {
    method: 'POST',
    headers: {
      'Web-Token': token,
      ...form.getHeaders()
    },
    body: form
  })

  let json = await res.json()

  if (!json.url) throw 'Gagal removebg'

  let img = await fetch(json.url)
  return Buffer.from(await img.arrayBuffer())
}