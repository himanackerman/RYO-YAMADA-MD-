import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import moment from 'moment-timezone'

moment.locale('id')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const cooldown = new Map()

const menuImage = "https://raw.githubusercontent.com/himanackerman/Image/main/1768276639285-362.jpeg"
const thumbImage = "https://raw.githubusercontent.com/himanackerman/Image/main/1768274212195-581.jpeg"
const audioPath = path.join(process.cwd(), 'media', 'tes.mp3')

function formatTag(tag) {
  return tag
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function ucapan() {
  const jam = moment.tz('Asia/Jakarta').hour()
  if (jam >= 4 && jam < 11) return 'Selamat Pagi'
  if (jam >= 11 && jam < 15) return 'Selamat Siang'
  if (jam >= 15 && jam < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

const defaultMenu = {
  before: `
${ucapan()}, *%name!*
Berikut informasi mengenai bot ini:

┏━━  *BOT INFORMATION*  ━━┓
┃ *✨ Bot name:* %botname
┃ *👑 Creator:* %owner
┃ *⚙️ Version:* %version
┃ *📦 Type:* Plugins ESM
┗━━━━━━━━━━━━━━━━━━

┌ ◦ *[ USER INFO ]*
│ ◦ Limit : *%limit*
│ ◦ Role  : *%role*
│ ◦ Total XP : *%totalexp*
└────
%readmore
`.trim(),
  header: '╭─「 *%category* 」',
  body: '│ • %cmd',
  footer: '╰────\n',
  after: `✨ *%botname* ✨`
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {

    const who = m.sender
    let user = global.db.data.users[who] || {
      limit: 0,
      premiumTime: 0,
      exp: 0,
      role: 'Beginner',
      registered: false
    }

    const isDeveloper = global.owner?.some(v => {
      if (Array.isArray(v)) return who.includes(v[0])
      return who.includes(v)
    })

    let botname = global.namebot || conn.user?.name || 'Bot'
    let owner   = global.nameown || 'Owner'
    let version = global.version || '1.0.0'

    let name = m.pushName || 'User'

    let limit = (isDeveloper || user.premiumTime >= 1)
      ? '∞ Unlimited'
      : user.limit

    let role = isDeveloper ? 'Owner' : (user.role || 'Beginner')

    let totalexp = user.totalexp || user.exp || 0
    let uptime = clockString(process.uptime() * 1000)

    let plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)
    let categories = {}

    for (let plugin of plugins) {
      let helps = Array.isArray(plugin.help) ? plugin.help : plugin.help ? [plugin.help] : []
      let tags = Array.isArray(plugin.tags) ? plugin.tags : plugin.tags ? [plugin.tags] : []

      for (let tag of tags) {
        if (!tag) continue
        if (!categories[tag]) categories[tag] = []
        categories[tag].push({
          helps,
          limit: !!plugin.limit,
          premium: !!plugin.premium,
          prefix: !!plugin.customPrefix
        })
      }
    }

    const readMore = String.fromCharCode(8206).repeat(4001)

    let replace = {
      name,
      limit,
      role,
      totalexp,
      botname,
      owner,
      version,
      readmore: readMore,
      p: usedPrefix
    }

    let menuType = text?.toLowerCase().trim()
    let menuText = []
    let { before, header, body, footer, after } = defaultMenu

    if (!menuType) {
      let list = Object.keys(categories)
        .sort()
        .map(t => `│ • \`${usedPrefix + command} ${t}\``)
        .join('\n')

      menuText = [
        before.replace(/%(\w+)/g, (_, k) => replace[k] || _),
        "✨ *DAFTAR MENU*",
        "╭─「 *MENU TERSEDIA* 」",
        `│ • \`${usedPrefix + command} all\``,
        list,
        "╰────\n",
        `Ketik: \`${usedPrefix + command} <menu>\``,
        `Contoh: \`${usedPrefix + command} ai\`\n`,
        after.replace(/%(\w+)/g, (_, k) => replace[k] || _)
      ]
    }

    else if (menuType === 'all') {
      menuText.push(before.replace(/%(\w+)/g, (_, k) => replace[k] || _))

      for (let tag of Object.keys(categories).sort()) {
        menuText.push(header.replace('%category', formatTag(tag)))

        for (let item of categories[tag]) {
          for (let cmd of item.helps) {
            let premium = item.premium ? ' (🄿)' : ''
            let lim = item.limit ? ' (🄻)' : ''
            let prefix = item.prefix ? '' : usedPrefix
            menuText.push(body.replace('%cmd', `${prefix}${cmd}${premium}${lim}`))
          }
        }
        menuText.push(footer)
      }

      menuText.push(after.replace(/%(\w+)/g, (_, k) => replace[k] || _))
    }

    else if (categories[menuType]) {
      menuText.push(before.replace(/%(\w+)/g, (_, k) => replace[k] || _))
      menuText.push(header.replace('%category', formatTag(menuType)))

      for (let item of categories[menuType]) {
        for (let cmd of item.helps) {
          let premium = item.premium ? ' (🄿)' : ''
          let lim = item.limit ? ' (🄻)' : ''
          let prefix = item.prefix ? '' : usedPrefix
          menuText.push(body.replace('%cmd', `${prefix}${cmd}${premium}${lim}`))
        }
      }

      menuText.push(footer)
      menuText.push(after.replace(/%(\w+)/g, (_, k) => replace[k] || _))
    }

    else {
      menuText = [
        `❌ Menu *${text}* tidak ditemukan.`,
        `Ketik *${usedPrefix + command}* untuk melihat daftar menu.`
      ]
    }

    let finalText = menuText.join('\n').replace(/%(\w+)/g, (_, k) => replace[k] || _)

    await conn.sendMessage(m.chat, {
      image: { url: menuImage },
      caption: finalText,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: `${botname} WhatsApp Bot ✨`,
          body: `Uptime: ${uptime}`,
          thumbnailUrl: thumbImage,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: global.fkontak || m })

    let last = cooldown.get(m.sender) || 0
    if (isDeveloper || Date.now() - last > 60_000) {
      cooldown.set(m.sender, Date.now())

      await conn.sendFile(
        m.chat,
        audioPath,
        'menu.mp3',
        null,
        global.fkontak || m,
        true,
        {
          type: 'audioMessage',
          ptt: true
        }
      )
    }

  } catch (e) {
    console.error(e)
    m.reply("❌ Menu error, coba lagi nanti.")
  }
}

handler.command = /^(menu|hep)$/i
handler.tags = ['main']
handler.help = ['menu', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}
