const PAGE_URL = 'https://www.iloveimg.com/upscale-image'

async function upscaleImage(input, scale = 2) {
  try {
    const page = await fetch(PAGE_URL, {
      signal: AbortSignal.timeout(30000)
    })

    if (!page.ok) throw new Error(`Halaman: ${page.status}`)

    const html = await page.text()

    const token = html.match(/"token"\s*:\s*"(eyJ[^"]+)"/)?.[1]
    const taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*['"]([^'"]+)['"]/)?.[1]

    const serversMatch = html.match(/"servers"\s*:\s*\[([^\]]+)\]/)
    const servers = serversMatch
      ? [...serversMatch[1].matchAll(/"([^"]+)"/g)].map(x => x[1])
      : []

    if (!token || !taskId || !servers.length) {
      throw new Error('Token, taskId, atau server tidak ditemukan')
    }

    const buffer = Buffer.from(input)

    if (!buffer.length) throw new Error('Gambar kosong')

    if (![2, 4].includes(Number(scale))) {
      throw new Error('Scale yang didukung: 2 atau 4')
    }

    const filename = 'image.jpg'
    const mimeType = 'image/jpeg'
    const serverUrl = `https://${servers[0]}.iloveimg.com`

    const headers = {
      Authorization: `Bearer ${token}`,
      Origin: 'https://www.iloveimg.com',
      Referer: PAGE_URL
    }

    const form = new FormData()
    form.append('name', filename)
    form.append('chunk', '0')
    form.append('chunks', '1')
    form.append('task', taskId)
    form.append('preview', '1')
    form.append(
      'file',
      new Blob([buffer], { type: mimeType }),
      filename
    )

    const upload = await fetch(`${serverUrl}/v1/upload`, {
      method: 'POST',
      headers,
      body: form,
      signal: AbortSignal.timeout(60000)
    })

    const uploadText = await upload.text()

    if (!upload.ok) {
      throw new Error(`Upload ${upload.status}: ${uploadText.slice(0, 300)}`)
    }

    const uploaded = JSON.parse(uploadText)

    if (!uploaded.server_filename) {
      throw new Error('server_filename tidak ditemukan')
    }

    const upscaleForm = new FormData()
    upscaleForm.append('task', taskId)
    upscaleForm.append('server_filename', uploaded.server_filename)
    upscaleForm.append('scale', String(scale))

    const response = await fetch(`${serverUrl}/v1/upscale`, {
      method: 'POST',
      headers,
      body: upscaleForm,
      signal: AbortSignal.timeout(120000)
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Upscale ${response.status}: ${errText.slice(0, 300)}`)
    }

    const output = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || ''

    if (!output.length || !contentType.startsWith('image/')) {
      throw new Error(`Output bukan gambar: ${contentType}`)
    }

    return {
      success: true,
      buffer: output,
      contentType,
      outputSize: output.length,
      scale: Number(scale)
    }

  } catch (error) {
    return {
      success: false,
      error: error.message || String(error)
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const quoted = m.quoted || m
    const mime = quoted.mimetype || quoted.msg?.mimetype || ''

    if (!/image/.test(mime)) {
      return m.reply(
        `Reply atau kirim gambar dengan caption:\n\n` +
        `${usedPrefix + command} 2\n` +
        `${usedPrefix + command} 4`
      )
    }

    const scale = Number(args[0] || 2)

    if (![2, 4].includes(scale)) {
      return m.reply('Scale hanya tersedia 2x atau 4x!')
    }

    await m.reply('Sedang meningkatkan kualitas gambar...')

    const media = await quoted.download()

    if (!media?.length) {
      return m.reply('Gagal mengunduh gambar!')
    }

    const result = await upscaleImage(media, scale)

    if (!result.success) {
      throw new Error(result.error)
    }

    await conn.sendMessage(
      m.chat,
      {
        image: result.buffer,
        mimetype: result.contentType,
        caption: `HD berhasil!\nResolusi ditingkatkan ${scale}x.`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await m.reply(`Gagal HD: ${e.message}`)
  }
}

handler.help = ['hd <2/4>']
handler.tags = ['image']
handler.command = /^hd$/i
handler.limit = true

export default handler