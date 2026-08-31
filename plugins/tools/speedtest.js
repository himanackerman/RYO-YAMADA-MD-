import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)
const SPEEDTEST_SCRIPT = path.join(process.cwd(), 'speed.py')

let handler = async (m, { conn }) => {
  await m.reply(' Lagi ngetes kecepatan koneksi server, tunggu bentar ya...')

  try {
    const { stdout } = await execAsync(
      `python3 "${SPEEDTEST_SCRIPT}" --simple`,
      {
        timeout: 60000
      }
    )

    const ping = stdout.match(/Ping:\s*([\d.]+)\s*ms/i)?.[1]
    const download = stdout.match(/Download:\s*([\d.]+)\s*Mbit/i)?.[1]
    const upload = stdout.match(/Upload:\s*([\d.]+)\s*Mbit/i)?.[1]

    if (!ping || !download || !upload) {
      throw new Error('Gagal parsing hasil speedtest:\n' + stdout)
    }

    await m.reply(`
🌐 *Speedtest Result*

⚡ Ping     : ${ping} ms
📥 Download : ${download} Mbps
📤 Upload   : ${upload} Mbps
`.trim())
  } catch (e) {
    console.error('speedtest error:', e)

    const msg = e.stderr || e.message || e

    m.reply(
      '❌ Gagal ngetes speed: ' +
      (typeof msg === 'string'
        ? msg.slice(0, 300)
        : String(msg))
    )
  }
}

handler.help = ['speedtest']
handler.tags = ['tools']
handler.command = /^speedtest$/i
handler.owner = true

export default handler