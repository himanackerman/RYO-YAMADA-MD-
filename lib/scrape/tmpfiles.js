export async function tmpfiles(buffer, filename = 'file.bin', mime = 'application/octet-stream') {
  const form = new FormData()

  form.append(
    'file',
    new Blob([buffer], { type: mime }),
    filename
  )

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form
  })

  const data = await res.json()

  if (data.status !== 'success') {
    throw new Error(data.message || 'Upload gagal')
  }

  return {
    url: data.data.url.replace(
      'https://tmpfiles.org/',
      'https://tmpfiles.org/dl/'
    )
  }
}

export default tmpfiles