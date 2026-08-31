import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

let handler = async (m) => {
  try {
    const script = `
import sys
import pkgutil

modules = sorted([x.name for x in pkgutil.iter_modules()])
print("\\n".join(modules))
`

    const { stdout } = await execFileAsync(
      'python3',
      ['-c', script],
      { timeout: 30000 }
    )

    const modules = stdout.trim()

    if (!modules) {
      return m.reply('Tidak ada module tambahan yang ditemukan.')
    }

    const maxLength = 3500

    await m.reply(
      `🐍 *Python Modules*\n\n${
        modules.length > maxLength
          ? modules.slice(0, maxLength) + '\\n\\n...masih ada lagi.'
          : modules
      }`
    )
  } catch (e) {
    console.error('pymodules error:', e)

    m.reply(
      '❌ Gagal mengecek module:\n' +
      (e.stderr || e.message || e)
    )
  }
}

handler.help = ['pymodules']
handler.tags = ['tools']
handler.command = /^py(modules?|mods?)$/i
handler.owner = true

export default handler