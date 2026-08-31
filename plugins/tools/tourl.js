import axios from 'axios'
import FormData from 'form-data'
import { generateWAMessageFromContent, proto } from 'baileys'

let handler = async (m, { conn }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''

  if (!mime) {
    throw 'Reply atau kirim file yang mau diupload.'
  }

  await m.react('🕒')

  try {
    const buffer = await q.download()

    if (!buffer) {
      throw new Error('Gagal download media.')
    }

    const ext = mime.split('/')[1]?.split(';')[0] || 'bin'
    const filename = q.fileName || `upload_${Date.now()}.${ext}`

    const form = new FormData()

    form.append('reqtype', 'fileupload')

    form.append('fileToUpload', buffer, {
      filename,
      contentType: mime
    })

    const { data } = await axios.post(
      'https://catbox.moe/user/api.php',
      form,
      {
        headers: form.getHeaders(),
        timeout: 60000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    )

    const url = typeof data === 'string' ? data.trim() : ''

    if (!url.startsWith('https://')) {
      throw new Error(url || 'Gagal upload ke Catbox.')
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `✨ *Upload Berhasil!*\n\n${url}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Copy URL',
                    copy_code: url
                  })
                }
              ]
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(
      m.chat,
      msg.message,
      { messageId: msg.key.id }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)

    await m.react('❌')

    throw e.message || String(e)
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^tourl$/i
handler.limit = true
handler.register = true

export default handler