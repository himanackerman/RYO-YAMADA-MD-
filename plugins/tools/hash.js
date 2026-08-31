import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Masukkan teks.\n\nContoh:\n*${usedPrefix + command} halo dunia*`)
  }

  try {
    const pythonCode = `
import sys
import hashlib

text = sys.argv[1].encode('utf-8')

print("MD5:" + hashlib.md5(text).hexdigest())
print("SHA1:" + hashlib.sha1(text).hexdigest())
print("SHA256:" + hashlib.sha256(text).hexdigest())
print("SHA512:" + hashlib.sha512(text).hexdigest())
`

    const { stdout } = await execFileAsync(
      'python3',
      ['-c', pythonCode, text],
      { timeout: 10000 }
    )

    const result = Object.fromEntries(
      stdout
        .trim()
        .split('\n')
        .map(line => {
          const index = line.indexOf(':')
          return [
            line.slice(0, index),
            line.slice(index + 1)
          ]
        })
    )

    await m.reply(`
🔐 *HASH RESULT*

• *MD5*
${result.MD5}

• *SHA1*
${result.SHA1}

• *SHA256*
${result.SHA256}

• *SHA512*
${result.SHA512}
`.trim())
  } catch (e) {
    console.error('hash error:', e)

    await m.reply(
      '❌ Gagal membuat hash: ' +
      (e.stderr || e.message || e)
    )
  }
}

handler.help = ['hash <text>']
handler.tags = ['tools']
handler.command = /^hash$/i

export default handler