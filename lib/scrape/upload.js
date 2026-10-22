import axios from 'axios'
import FormData from 'form-data'

export async function upload(buffer, filename = 'file.bin') {
  const form = new FormData()
  form.append('file', buffer, filename)

  const { data } = await axios.post(
    'https://cdn.nekohime.site/upload',
    form,
    {
      headers: form.getHeaders()
    }
  )

  if (!data?.files?.length) {
    throw new Error('Upload gagal')
  }

  return {
    url: data.files[0].url || data.files[0]
  }
}

export default upload