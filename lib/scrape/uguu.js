export async function uguu(buffer, filename = 'file.bin', mime = 'application/octet-stream') {
  const form = new FormData()

  form.append(
    'files[]',
    new Blob([buffer], { type: mime }),
    filename
  )

  const res = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: form
  })

  const data = await res.json()

  if (!data.success) {
    throw new Error(data.description)
  }

  return {
    url: data.files[0].url
  }
}

export default uguu