import { uploadVidey } from '../../lib/scrape/videy.js'
import fs from 'fs'

let handler = async (m, { conn }) => {
  if (!m.quoted) throw 'Reply video atau audio'

  const mime = m.quoted.mimetype || ''
  if (!/video|audio/.test(mime)) throw 'Reply file video/audio'

  await m.react('✨')

  const buffer = await m.quoted.download()
  const filePath = `./tmp_${Date.now()}.mp4`

  fs.writeFileSync(filePath, buffer)

  await m.react('🎸')

  const res = await uploadVidey(filePath)

  fs.unlinkSync(filePath)

  if (!res?.link) throw 'Upload gagal'

  await m.react('🌿')

  m.reply(`🎸 Upload Complete

🔗 ${res.link}`)
}

handler.help = ['upvidey']
handler.tags = ['tools']
handler.command = /^upvidey$/i
handler.limit = true

export default handler