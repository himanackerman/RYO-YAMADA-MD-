/**
 * Ini sc free jangan di jual ya
 * Base Nao ESM 
 * Info script di CH https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 **/
 
import moment from 'moment-timezone'
import fetch from 'node-fetch'

moment.locale('id')

const THUMB = global.menuThumb
const MENU_SOUND = global.menuAudio

const mapFrom = 'abcdefghijklmnopqrstuvwxyz1234567890'
const mapTo = [
  'ᴀ','ʙ','ᴄ','ᴅ','ᴇ','ꜰ','ɢ','ʜ','ɪ','ᴊ','ᴋ','ʟ','ᴍ',
  'ɴ','ᴏ','ᴘ','q','ʀ','ꜱ','ᴛ','ᴜ','ᴠ','ᴡ','x','ʏ','ᴢ',
  '1','2','3','4','5','6','7','8','9','0'
]

function toSmallCaps(text = '') {
  return text
    .toLowerCase()
    .split('')
    .map(c => {
      const i = mapFrom.indexOf(c)
      return i !== -1 ? mapTo[i] : c
    })
    .join('')
}

function formatTag(tag) {
  return tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function randomSquare() {
  return Array.isArray(global.hsquere)
    ? global.hsquere[Math.floor(Math.random() * global.hsquere.length)]
    : ''
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const who = m.sender
    let user = global.db.data.users[who]

    const isOwner = Array.isArray(global.owner)
      ? global.owner.some(v => (Array.isArray(v) ? v[0] : v) === who.split('@')[0])
      : false

    let botname = global.namebot || conn.user?.name || 'RyoYamada-MD'
    let owner = global.nameown || 'Owner'
    let version = global.version || '1.0.0'

    let limit = (isOwner || user.premiumTime >= 1)
      ? '∞ Unlimited'
      : user.limit

    let role = isOwner ? 'Owner' : (user.role || 'Newbie')
    let totalexp = user.totalexp || user.exp || 0

    let plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)
    let categories = {}

    for (let p of plugins) {
      let helps = Array.isArray(p.help) ? p.help : [p.help]
      let tags = Array.isArray(p.tags) ? p.tags : [p.tags]

      for (let tag of tags) {
        if (!tag) continue
        tag = tag.toLowerCase().trim()
        if (!categories[tag]) categories[tag] = []
        categories[tag].push({
          helps,
          limit: p.limit,
          premium: p.premium,
          owner: p.owner,
          admin: p.admin,
          prefix: !p.customPrefix
        })
      }
    }

    let menuType = (text || '').toLowerCase().trim()
    let arrayMenu = Object.keys(categories).sort()

    let rows = arrayMenu.map(v => ({
      title: `${global.pmenus} ${toSmallCaps(formatTag(v))}`,
      description: toSmallCaps(`Menu ${formatTag(v)}`),
      id: `${usedPrefix}${command} ${v}`
    }))

    if (!menuType || (!categories[menuType] && menuType !== 'all')) {
      await conn.sendMessage(
        m.chat,
        {
          image: { url: THUMB },
          caption: `
${toSmallCaps('Hai, aku')} *${toSmallCaps('Ryo Yamada')}*,
${toSmallCaps('siap bantu kamu hari ini — pilih menu yang kamu butuhin ya.')}

${global.dashmenu} ${global.htjava}

${global.dmenut} *${toSmallCaps('BOT INFO')}*
${global.dmenub2} ${toSmallCaps('Bot')}     : ${toSmallCaps(botname)}
${global.dmenub2} ${toSmallCaps('Owner')}   : ${toSmallCaps(owner)}
${global.dmenub2} ${toSmallCaps('Version')} : ${version}
${global.dmenuf}

${global.dmenut} *${toSmallCaps('USER INFO')}*
${global.dmenub2} ${toSmallCaps('Limit')} : ${limit}
${global.dmenub2} ${toSmallCaps('Role')}  : ${toSmallCaps(role)}
${global.dmenub2} XP    : ${totalexp}
${global.dmenuf}

${global.dmenut} *${toSmallCaps('KETERANGAN')}*
${global.dmenub2} ${global.lopr} = ${toSmallCaps('Premium')}
${global.dmenub2} ${global.lolm} = ${toSmallCaps('Limit')}
${global.dmenub2} Ⓞ = ${toSmallCaps('Owner')}
${global.dmenub2} Ⓐ = ${toSmallCaps('Admin')}
${global.dmenuf}
`.trim(),
          interactiveButtons: [
            {
              name: 'single_select',
              buttonParamsJson: JSON.stringify({
                title: '✨ Pilih Menu',
                sections: [
                  {
                    title: `💠 Total Menu ${arrayMenu.length}`,
                    rows
                  }
                ]
              })
            },
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '✨ All MENU',
                id: `${usedPrefix}${command} all`
              })
            }
          ]
        },
        { quoted: global.fkontak }
      )

      if (MENU_SOUND) await sendMenuSound(conn, m)
      return
    }

    let menuText = []
    let targets = menuType === 'all' ? arrayMenu : [menuType]

    for (let tag of targets) {
      menuText.push(
        `${global.cmenut}${randomSquare()} ${toSmallCaps(formatTag(tag))} ${randomSquare()}${global.cmenuh}`
      )

      for (let item of categories[tag]) {
        for (let cmd of item.helps) {
          let flag =
            (item.premium ? ` ${global.lopr}` : '') +
            (item.limit ? ` ${global.lolm}` : '') +
            (item.owner ? ' Ⓞ' : '') +
            (item.admin ? ' Ⓐ' : '')

          let prefix = item.prefix ? usedPrefix : ''
          menuText.push(`${global.cmenub}${prefix}${toSmallCaps(cmd)}${flag}`)
        }
      }

      menuText.push(global.cmenuf)
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: THUMB },
        caption: menuText.join('\n')
      },
      { quoted: global.fkontak }
    )

    if (MENU_SOUND) await sendMenuSound(conn, m)

  } catch (e) {
    console.error(e)
    m.reply('Menu error.')
  }
}

handler.command = /^(menu|help)$/i
handler.tags = ['main']
handler.help = ['menu']

export default handler

async function sendMenuSound(conn, m) {
  try {
    await conn.sendFile(
      m.chat,
      MENU_SOUND,
      'menu.mp3',
      null,
      m,
      true,
      { type: 'audioMessage', ptt: true }
    )
  } catch (e) {
    console.error(e)
  }
}