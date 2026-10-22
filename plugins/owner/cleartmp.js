import { tmpdir } from 'os'
import { join } from 'path'
import { existsSync, readdirSync, rmSync, statSync } from 'fs'

const MIN_AGE = 30 * 1000

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

let handler = async (m) => {
  const folders = [...new Set([tmpdir(), join(process.cwd(), 'tmp')])]
  let count = 0
  let size = 0
  let skipped = 0

  for (const folder of folders) {
    if (!existsSync(folder)) continue

    let items = []
    try {
      items = readdirSync(folder)
    } catch {
      continue
    }

    for (const item of items) {
      const itemPath = join(folder, item)
      try {
        const stats = statSync(itemPath)

        if (stats.mtimeMs && Date.now() - stats.mtimeMs < MIN_AGE) {
          skipped++
          continue
        }

        // Hitung ukuran kasar atau langsung hapus folder/file secara rekursif
        size += stats.size || 0
        rmSync(itemPath, { recursive: true, force: true })
        count++
      } catch {
        skipped++
      }
    }
  }

  let text = count
    ? `✅ Berhasil membersihkan *${count}* item (file/folder) di direktori tmp (*${formatSize(size)}*).`
    : 'ℹ️ Tidak ada file atau folder sementara yang perlu dihapus.'

  if (skipped) text += `\n\n${skipped} item dilewati (baru dibuat atau sedang dipakai).`

  await m.reply(text)
}

handler.help = ['cleartmp']
handler.tags = ['owner']
handler.command = /^(cleartmp|cleantmp|cleartemp)$/i
handler.owner = true

export default handler