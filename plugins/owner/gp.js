import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
import { generateWAMessageFromContent, proto } from 'baileys'

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

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `📄 *Plugin:* ${target}.js\n📁 *Folder:* plugins/${target.includes('/') ? target.split('/')[0] : ''}\n\nTekan tombol di bawah untuk menyalin source code.`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'cta_copy',
                  buttonParamsJson: JSON.stringify({
                    display_text: ' Copy Source',
                    copy_code: code
                  })
                }
              ]
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(
      m.chat,
      msg.message,
      { messageId: msg.key.id }
    )

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