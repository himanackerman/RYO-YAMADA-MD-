import { spawn } from 'child_process'
import fs from 'fs'

const yt = {
  static: Object.freeze({
    baseUrl: 'https://cnv.cx',
    headers: {
      'accept-encoding': 'gzip, deflate, br, zstd',
      'origin': 'https://frame.y2meta-uk.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0'
    }
  }),
  log(m) { console.log(`[yt-skrep] ${m}`) },
  resolveConverterPayload(link, f = '128k') {
    const a = ['128k', '320k', '144p', '240p', '360p', '720p', '1080p']
    if (!a.includes(f)) throw Error(`invalid format. available: ${a.join(', ')}`)
    const t = f.endsWith('k') ? 'mp3' : 'mp4'
    const b = t === 'mp3' ? parseInt(f) + '' : '128'
    const v = t === 'mp4' ? parseInt(f) + '' : '720'
    return { link, format: t, audioBitrate: b, videoQuality: v, filenameStyle: 'pretty', vCodec: 'h264' }
  },
  sanitizeFileName(n) {
    const e = n.match(/\.[^.]+$/)[0]
    const f = n.replace(new RegExp(`\\${e}$`), '').replaceAll(/[^A-Za-z0-9]/g, '_').replace(/_+/g, '_').toLowerCase()
    return f + e
  },
  async getBuffer(u) {
    const h = structuredClone(this.static.headers)
    h.referer = 'https://v6.www-y2mate.com/'
    h.range = 'bytes=0-'
    delete h.origin
    const r = await fetch(u, { headers: h })
    if (!r.ok) throw Error(`${r.status} ${r.statusText}`)
    const ab = await r.arrayBuffer()
    return Buffer.from(ab)
  },
  async getKey() {
    const r = await fetch(this.static.baseUrl + '/v2/sanity/key', { headers: this.static.headers })
    if (!r.ok) throw Error(`${r.status} ${r.statusText}`)
    return await r.json()
  },
  async convert(u, f) {
    const { key } = await this.getKey()
    const p = this.resolveConverterPayload(u, f)
    const h = { key, ...this.static.headers }
    const r = await fetch(this.static.baseUrl + '/v2/converter', { headers: h, method: 'post', body: new URLSearchParams(p) })
    if (!r.ok) throw Error(`${r.status} ${r.statusText}`)
    return await r.json()
  },
  async download(u, f) {
    const { url, filename } = await this.convert(u, f)
    const buffer = await this.getBuffer(url)
    return { fileName: this.sanitizeFileName(filename), buffer }
  }
}

async function convertToFast(buffer) {
  const tempIn = './temp_in.mp4'
  const tempOut = './temp_out.mp4'
  fs.writeFileSync(tempIn, buffer)
  await new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-i', tempIn, '-c', 'copy', '-movflags', 'faststart', tempOut])
    ff.on('close', code => code === 0 ? res() : rej(new Error('ffmpeg convert error')))
  })
  const newBuffer = fs.readFileSync(tempOut)
  fs.unlinkSync(tempIn)
  fs.unlinkSync(tempOut)
  return newBuffer
}

let handler = async (m, { conn, args, command }) => {
  try {
    switch (command) {
      case 'ytv2': {
        if (!args[0]) return m.reply(`*Example :* .${command} https://youtu.be/JiEW1agPqNY?si=OUpQ4GCaQpLKTL0H`)
        let f = args[1] || '1080p'
        let { buffer, fileName } = await yt.download(args[0], f)
        buffer = await convertToFast(buffer)
        await conn.sendMessage(m.chat, { video: buffer, mimetype: 'video/mp4', fileName }, { quoted: m })
        break
      }
      case 'yta2': {
        if (!args[0]) return m.reply(`*Example :* .${command} https://youtu.be/JiEW1agPqNY?si=OUpQ4GCaQpLKTL0H`)
        let f = args[1] || '128k'
        let { buffer, fileName } = await yt.download(args[0], f)
        await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName }, { quoted: m })
        break
      }
    }
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['ytv2', 'yta2']
handler.tags = ['downloader']
handler.command = ['ytv2', 'yta2']

export default handler