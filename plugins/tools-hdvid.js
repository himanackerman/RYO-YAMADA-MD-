async function hdvideo(buffer) {
    try {
      const baseApi = 'https://api.unblurimage.ai'
      const productSerial = crypto.randomUUID().replace(/-/g, '')

      if (!buffer) throw new Error('Videonya mana')

      const sleep = ms => new Promise(r => setTimeout(r, ms))

      async function jsonFetch(url, options = {}) {
        const res = await fetch(url, options)
        const text = await res.text()
        let json
        try {
          json = text ? JSON.parse(text) : null
        } catch {
          return { __httpError: true, status: res.status, raw: text }
        }
        if (!res.ok) return { __httpError: true, status: res.status, raw: json }
        return json
      }

      const uploadForm = new FormData()
      uploadForm.set('video_file_name', `cli-${Date.now()}.mp4`)

      const uploadResp = await jsonFetch(`${baseApi}/api/upscaler/v1/ai-video-enhancer/upload-video`, {
        method: 'POST',
        body: uploadForm
      })

      if (uploadResp.__httpError || uploadResp.code !== 100000) throw new Error('Upload gagal')

      const { url: uploadUrl, object_name } = uploadResp.result || {}
      if (!uploadUrl || !object_name) throw new Error('Upload invalid')

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': 'video/mp4' },
        body: buffer
      })

      if (!putRes.ok) throw new Error('Upload video gagal')

      const cdnUrl = `https://cdn.unblurimage.ai/${object_name}`

      const jobForm = new FormData()
      jobForm.set('original_video_file', cdnUrl)
      jobForm.set('resolution', '2k')
      jobForm.set('is_preview', 'false')

      const createJobResp = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/create-job`, {
        method: 'POST',
        body: jobForm,
        headers: {
          'product-serial': productSerial,
          authorization: ''
        }
      })

      if (createJobResp.__httpError || createJobResp.code !== 100000) throw new Error('Create job gagal')

      const { job_id, long_video } = createJobResp.result || {}
      if (!job_id) throw new Error('Job tidak valid')

      const startTime = Date.now()
      let attempt = 0
      let result

      while (true) {
        attempt++

        const jobResp = await jsonFetch(`${baseApi}/api/upscaler/v2/ai-video-enhancer/get-job/${job_id}`, {
          method: 'GET',
          headers: {
            'product-serial': productSerial,
            authorization: ''
          }
        })

        if (jobResp.__httpError) throw new Error('Get job gagal')

        if (jobResp.code === 100000) {
          result = jobResp.result || {}
          if (result.output_url) break
        }

        if (Date.now() - startTime > 300000) throw new Error('Timeout proses')

        await sleep(attempt === 1 ? 30000 : 10000)
      }

      return {
        input_url: result.input_url,
        output_url: result.output_url
      }

    } catch (e) {
      throw new Error(e.message)
    }
  }

let handler = async (m, { conn }) => {
    try {
      const q = m.quoted ? m.quoted : m
      const mime = (q.msg || q).mimetype || ''
      if (!mime.startsWith('video/')) return m.reply('Mana videonya')

      const buffer = await q.download()
      const res = await hdvideo(buffer)

      conn.sendMessage(
        m.chat,
        {
          document: { url: res.output_url },
          mimetype: 'video/mp4',
          fileName: 'nganu.mp4'
        },
        { quoted: m }
      )
    } catch (e) {
      m.reply(e.message)
    }
  }

handler.help = ['hdvid']
handler.tags = ['ai']
handler.command = ['hdvid']
handler.limit = true;

export default handler