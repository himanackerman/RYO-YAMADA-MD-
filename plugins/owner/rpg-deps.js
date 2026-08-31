import fs from 'fs'
import path from 'path'
import { performance } from 'perf_hooks'

let handler = async (m) => {
    const start = performance.now()

    let pkg
    try {
        pkg = JSON.parse(fs.readFileSync('./package.json'))
    } catch {
        return m.reply('❌ package.json tidak ditemukan')
    }

    const deps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {})
    }

    const files = []

    function scan(dir) {
        for (const file of fs.readdirSync(dir)) {
            const full = path.join(dir, file)

            if (
                full.includes('node_modules') ||
                full.includes('.git')
            ) continue

            const stat = fs.statSync(full)

            if (stat.isDirectory()) {
                scan(full)
            } else if (file.endsWith('.js')) {
                files.push(full.replace(/\\/g, '/'))
            }
        }
    }

    scan('./')

    const usage = {}

    for (const mod of Object.keys(deps)) {
        usage[mod] = []
    }

    const patterns = [
        /from\s+['"`]([^'"`]+)['"`]/g,
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    ]

    for (const file of files) {
        let content

        try {
            content = fs.readFileSync(file, 'utf8')
        } catch {
            continue
        }

        for (const regex of patterns) {
            let match

            while ((match = regex.exec(content)) !== null) {
                let mod = match[1]

                if (
                    mod.startsWith('.') ||
                    mod.startsWith('/')
                ) continue

                let moduleName = mod.startsWith('@')
                    ? mod.split('/').slice(0, 2).join('/')
                    : mod.split('/')[0]

                if (usage[moduleName]) {
                    if (!usage[moduleName].includes(file)) {
                        usage[moduleName].push(file)
                    }
                }
            }
        }
    }

    const active = []
    const unused = []

    for (const mod of Object.keys(deps)) {
        if (usage[mod].length) active.push(mod)
        else unused.push(mod)
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(2)

    let txt = `*S Y S T E M   D E P E N D E N C I E S*\n\n`

    txt += `*S T A T I S T I C S*\n`
    txt += `> Total Module  : ${Object.keys(deps).length}\n`
    txt += `> Module Aktif  : ${active.length}\n`
    txt += `> Unused Module : ${unused.length}\n`
    txt += `> File Ter-scan : ${files.length} file (.js)\n`
    txt += `> Waktu Pindai  : ${elapsed} detik\n`
    txt += `──────────────────────────\n\n`

    txt += `*L O K A S I   M O D U L E*\n\n`

    for (const mod of active.sort()) {
        txt += `* [ ${mod.toUpperCase()} ]*\n`
        txt += `> Version : ${deps[mod]}\n`
        txt += `> Usage   : ${usage[mod].length} file\n`

        for (const file of usage[mod].slice(0, 20)) {
            txt += `  - ${file}\n`
        }

        if (usage[mod].length > 20) {
            txt += `  - dan ${usage[mod].length - 20} file lainnya\n`
        }

        txt += '\n'
    }

    txt += `──────────────────────────\n`
    txt += `*A C T I V E   M O D U L E S*\n`
    txt += '```'
    txt += active.sort().join(', ')
    txt += '```\n\n'

    txt += `──────────────────────────\n`
    txt += `*U N U S E D   M O D U L E S*\n`
    txt += '```'
    txt += unused.sort().join(', ') || '-'
    txt += '```\n'

    txt += '\n> Note: Kemungkinan module ini dipanggil secara dinamis atau memang tidak digunakan.'

    await m.reply(txt)
}

handler.help = ['deps']
handler.tags = ['owner']
handler.command = /^deps$/i
handler.owner = true

export default handler