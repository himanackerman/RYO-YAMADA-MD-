import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { tmpdir } from 'os'
import { downloadContentFromMessage } from 'baileys'

const CH_ID = '120363395114168746@newsletter'

async function streamToBuffer(stream) {
  let buffer = Buffer.from([])

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }

  return buffer
}

function convertToOpus(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioCodec('libopus')
      .audioBitrate('')
      .format('opus')
      .on('end', resolve)
      .on('error', reject)
      .save(output)
  })
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted =
    m.message?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage

  if (!quoted) {
    return m.reply(
      `❌ Reply media terlebih dahulu!\n\n` +
      `Contoh:\n${usedPrefix + command}`
    )
  }

  let media = null
  let type = ''
  let mimetype = ''

  const caption =
    quoted.imageMessage?.caption ||
    quoted.videoMessage?.caption ||
    m.quoted?.text ||
    ''

  if (quoted.imageMessage) {
    media = quoted.imageMessage
    type = 'image'
    mimetype = media.mimetype

  } else if (quoted.videoMessage) {
    media = quoted.videoMessage
    type = media.ptv ? 'ptv' : 'video'
    mimetype = media.mimetype

  } else if (quoted.audioMessage) {
    media = quoted.audioMessage
    type = 'audio'
    mimetype = media.mimetype

  } else if (quoted.stickerMessage) {
    media = quoted.stickerMessage
    type = 'sticker'
    mimetype = 'image/webp'
  }

  if (!media) {
    return m.reply('❌ Media tidak didukung!')
  }

  const ext =
    mimetype?.split('/')[1]?.split(';')[0] ||
    'bin'

  const filename = `${Date.now()}`

  const inputPath = path.join(tmpdir(), `${filename}.${ext}`)
  const opusPath = path.join(tmpdir(), `${filename}.opus`)

  try {
    await m.reply(`🔄 Sedang memproses ${type}...`)

    const stream = await downloadContentFromMessage(
      media,
      type === 'image'
        ? 'image'
        : type === 'video' || type === 'ptv'
        ? 'video'
        : type === 'audio'
        ? 'audio'
        : 'sticker'
    )

    const buffer = await streamToBuffer(stream)

    fs.writeFileSync(inputPath, buffer)

    switch (type) {
      case 'image':
        await conn.sendMessage(CH_ID, {
          image: fs.readFileSync(inputPath),
          caption
        })
      break

      case 'video':
        await conn.sendMessage(CH_ID, {
          video: fs.readFileSync(inputPath),
          caption
        })
      break

      case 'ptv':
        await conn.sendMessage(CH_ID, {
          video: fs.readFileSync(inputPath),
          ptv: true,
          caption
        })
      break

      case 'sticker':
        await conn.sendMessage(CH_ID, {
          sticker: fs.readFileSync(inputPath)
        })
      break

      case 'audio': {
        const isOpus =
          mimetype.includes('opus') ||
          mimetype.includes('ogg')

        if (isOpus) {
          fs.copyFileSync(inputPath, opusPath)
        } else {
          await convertToOpus(inputPath, opusPath)
        }

        await conn.sendMessage(CH_ID, {
          audio: fs.readFileSync(opusPath),
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        })
      }
      break
    }

    await m.reply(`✅ ${type} berhasil diupload ke channel!`)

  } catch (e) {
    console.error(e)

    m.reply(
      `❌ Error\n\n${e.message || e}`
    )

  } finally {
    try {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath)
      }
    } catch {}

    try {
      if (fs.existsSync(opusPath)) {
        fs.unlinkSync(opusPath)
      }
    } catch {}
  }
}

handler.help = ['upch']
handler.tags = ['owner']
handler.command = /^(upch|sendch)$/i
handler.owner = true

export default handler