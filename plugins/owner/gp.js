import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'

const exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  if (!isROwner) return

  if (!text) {
    throw `uhm.. mau ambil plugin yang mana?\n\n*Contoh penggunaan:*\n${usedPrefix + command} owner/getplugin\n\nUntuk melihat daftar semua plugin, ketik *${usedPrefix}listplugin*`
  }

  const plugins = Object.keys(global.plugins)
  const names = plugins.map(v => v.replace(/\.js$/, ''))

  let target = names.find(v => v === text || v.endsWith('/' + text))

  if (!target) {
    return m.reply(
      `❌ *Plugin tidak ditemukan!*\n\nPastikan menuliskan jalur folder dan namanya dengan benar.\nKetik *${usedPrefix}listplugin* untuk melihat daftar plugin yang ada.`
    )
  }

  await m.react('🕒')

  try {
    const { stdout, stderr } = await exec(`cat plugins/${target}.js`)

    if (stderr) throw new Error(stderr)

    const code = stdout.trim()
    const bodyText = `📄 *Plugin:* ${target}.js\n📁 *Folder:* plugins/${target.includes('/') ? target.split('/')[0] : ''}\n\nTekan tombol di bawah untuk menyalin source code.`

    await new Button(conn)
      .setBody(bodyText)
      .setFooter('ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ')
      .addCopy(' Copy Source', code, { icon: 'DOCUMENT' })
      .send(m.chat, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw e.message || String(e)
  }
}

handler.help = ['getplugin <folder/filename>']
handler.tags = ['owner']
handler.command = /^(getplugin|gp)$/i
handler.rowner = true

export default handler