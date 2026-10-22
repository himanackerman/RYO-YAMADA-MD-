import scraper from '@zenaveline/scraper'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const exec = promisify(execFile)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} https://soundcloud.com/chaseatlantic/swim-2`)
  }

  await m.react('🕒')

  try {
    const res = await scraper.allinonedownloader(text, 'soundcloud-downloader')

    if (!res?.items?.length) throw 'Audio tidak ditemukan.'

    const media = res.items[0]
    const out = path.join(os.tmpdir(), `${Date.now()}.m4a`)

    await exec('ffmpeg', [
      '-i', media.url,
      '-vn',
      '-c:a', 'copy',
      '-y',
      out
    ])

    await conn.sendFile(
      m.chat,
      out,
      `${media.title}.m4a`,
      `*Title:* ${media.title}
*Quality:* ${media.quality}`,
      m
    )

    fs.unlinkSync(out)
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    throw e
  }
}

handler.help = ['scdl <url>']
handler.tags = ['downloader']
handler.command = ['scdl', 'soundcloud']

export default handler