/*
creator : hilman 
ryo Yamada md
https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

import moment from 'moment-timezone'
import fs from 'fs'
import { prepareWAMessageMedia } from 'baileys'

let sharp
try {
  sharp = (await import('sharp')).default
} catch {}

moment.locale('id')

const MENU_IMAGE = './media/ryo.jpg'
const MENU_SOUND = './media/tes.mp3'
const MENU_LINK = 'https://github.com/himanackerman'

const smallCaps = {
  a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ꜰ', g:'ɢ', h:'ʜ',
  i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ',
  q:'q', r:'ʀ', s:'ꜱ', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
  y:'ʏ', z:'ᴢ',
  0:'0',1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9'
}

function toSmallCaps(text = '') {
  return text.toLowerCase().split('').map(c => smallCaps[c] || c).join('')
}

function formatTag(tag) {
  return tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

let handler = async (m, { conn, usedPrefix, command, text, isOwner }) => {
  try {
    const who = m.sender
    const user = global.db.data.users[who]

    const botname = global.namebot || conn.user?.name || 'ʀyᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ'

    const limit = (isOwner || user.premiumTime >= 1) ? '∞ Unlimited' : user.limit
    const role = isOwner ? 'Owner' : (user.role || 'Newbie')
    const totalexp = user.totalexp || user.exp || 0

    if (!fs.existsSync(MENU_IMAGE)) {
      return m.reply(`File ${MENU_IMAGE} tidak ditemukan`)
    }
    const mainBuffer = fs.readFileSync(MENU_IMAGE)

    const plugins = Object.values(global.plugins || {}).filter(p => !p.disabled)

    const categories = {}
    for (const p of plugins) {
      const helps = Array.isArray(p.help) ? p.help : [p.help]
      const tags = Array.isArray(p.tags) ? p.tags : [p.tags]
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

    const menuType = (text || '').toLowerCase().trim()
    const arrayMenu = Object.keys(categories).sort()
    const style = global.menuStyle || 1

    const buildCategoryText = (targets) => {
      let out = []
      for (const tag of targets) {
        if (!categories[tag]) continue
        out.push(`${global.cmenut}${global.pmenus} ${toSmallCaps(formatTag(tag))}${global.cmenuh}`)
        for (const item of categories[tag]) {
          for (const cmd of item.helps) {
            const prefix = item.prefix ? usedPrefix : ''
            let info = ''
            if (item.premium) info += ` ${global.lopr}`
            if (item.limit) info += ` ${global.lolm}`
            if (item.owner) info += ' Ⓞ'
            if (item.admin) info += ' Ⓐ'
            out.push(`${global.cmenub}${prefix}${toSmallCaps(cmd)}${info}`)
          }
        }
        out.push(global.cmenuf)
      }
      return out.join('\n')
    }

    const playSound = async () => {
      if (MENU_SOUND && fs.existsSync(MENU_SOUND)) {
        await conn.sendFile(m.chat, MENU_SOUND, 'menu.mp3', '', m, true, {
          mimetype: 'audio/mp4',
          ptt: true
        })
      }
    }

    // ===== STYLE 1: BUTTON =====
    if (style === 1) {

      if (!menuType || (!categories[menuType] && menuType !== 'all')) {

        await conn.sendMessage(m.chat, {
          image: mainBuffer,
          caption: '',
          footer: `
${toSmallCaps('hai, aku')} *${toSmallCaps(botname)}*,
${toSmallCaps('siap bantu kamu hari ini — pilih menu yang kamu butuhin ya.')}

${global.dashmenu || '┅═┅═❏ *DASHBOARD* ❏═┅═┅ ⫹⫺'}

${global.dmenut || 'ଓ═┅═━–〈'} *${toSmallCaps('user info')}*
${global.dmenub2 || '┊'} ${toSmallCaps('role')}  : ${toSmallCaps(role)} ㋡
${global.dmenub2 || '┊'} ${toSmallCaps('limit')} : ${limit}
${global.dmenub2 || '┊'} XP    : ${totalexp}
${global.dmenuf || '┗––––––––––✦'}

${global.dmenut || 'ଓ═┅═━–〈'} *${toSmallCaps('keterangan')}*
${global.dmenub2 || '┊'} Ⓟ = ${toSmallCaps('premium')}
${global.dmenub2 || '┊'} Ⓛ = ${toSmallCaps('limit')}
${global.dmenub2 || '┊'} Ⓞ = ${toSmallCaps('owner')}
${global.dmenub2 || '┊'} Ⓐ = ${toSmallCaps('admin')}
${global.dmenuf || '┗––––––––––✦'}
`.trim(),

          optionText: 'Pilih Menu',
          optionTitle: '📄 Menu Tersedia',
          offerText: 'ʀyᴏ yᴀᴍᴀᴅᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ',
          offerCode: 'ryo acumalaka',
          offerUrl: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2G',
          offerExpiration: Date.now() + 86400000,

          nativeFlow: [
            {
              text: ' Pilih Kategori Menu',
              sections: [
                {
                  title: `✨ Semua Kategori (${arrayMenu.length})`,
                  rows: arrayMenu.map(v => ({
                    header: '',
                    title: `${global.pmenus || '📌'} ${formatTag(v)}`,
                    description: `Lihat menu ${formatTag(v)}`,
                    id: `${usedPrefix}${command} ${v}`
                  }))
                }
              ],
              icon: 'review'
            },
            {
              text: '❏ All Menu',
              id: `${usedPrefix}${command} all`,
              icon: 'document'
            },
            {
              text: '❏ Owner',
              id: `${usedPrefix}owner`,
              icon: 'promotion'
            },
            {
              text: '❏ Channel',
              url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K',
              useWebview: true,
              icon: 'image'
            }
          ],
          interactiveAsTemplate: false
        }, { quoted: m })

        await playSound()
        return
      }
    }

    // ===== STYLE 2: LINK PREVIEW THUMBNAIL =====
    if (style === 2) {

      if (!menuType || (!categories[menuType] && menuType !== 'all')) {

        const caption = `
${toSmallCaps('hai, aku')} *${toSmallCaps(botname)}* ✨
${toSmallCaps('siap bantu kamu hari ini')}

❏ role : ${role.toUpperCase()}
❏ limit : ${limit}
❏ xp : ${totalexp}

${toSmallCaps('category list')}
${arrayMenu.map(t => `❏ MENU ${t.toUpperCase()}`).join('\n')}
❏ MENU ALL

${toSmallCaps('ketik salah satu menu di atas')}
`.trim()

        let hdThumb = mainBuffer
        if (sharp) {
          hdThumb = await sharp(mainBuffer)
            .resize(1280, 720)
            .jpeg({ quality: 100 })
            .toBuffer()
        }

        const { imageMessage: image } = await prepareWAMessageMedia({
          image: hdThumb
        }, {
          upload: conn.waUploadToServer,
          mediaTypeOverride: 'thumbnail-link'
        })

        image.width = 1280
        image.height = 720

        await conn.sendMessage(m.chat, {
          text: `${MENU_LINK}\n\n${caption}`,
          linkPreview: {
            'matched-text': MENU_LINK,
            title: botname,
            description: 'WhatsApp Multi Device Bot',
            previewType: 0,
            jpegThumbnail: hdThumb,
            highQualityThumbnail: image,
            linkPreviewMetadata: {
              linkMediaDuration: 0,
              socialMediaPostType: 4
            }
          }
        }, { quoted: m })

        await playSound()
        return
      }
    }

    if (style === 3) {

      if (!menuType || (!categories[menuType] && menuType !== 'all')) {

        const body = `
${toSmallCaps('hai, aku')} *${toSmallCaps(botname)}*,
${toSmallCaps('siap bantu kamu hari ini — pilih menu yang kamu butuhin ya.')}

${global.dashmenu || '┅═┅═❏ *DASHBOARD* ❏═┅═┅ ⫹⫺'}

${global.dmenut || 'ଓ═┅═━–〈'} *${toSmallCaps('user info')}*
${global.dmenub2 || '┊'} ${toSmallCaps('role')}  : ${toSmallCaps(role)} ㋡
${global.dmenub2 || '┊'} ${toSmallCaps('limit')} : ${limit}
${global.dmenub2 || '┊'} XP    : ${totalexp}
${global.dmenuf || '┗––––––––––✦'}

${global.dmenut || 'ଓ═┅═━–〈'} *${toSmallCaps('keterangan')}*
${global.dmenub2 || '┊'} Ⓟ = ${toSmallCaps('premium')}
${global.dmenub2 || '┊'} Ⓛ = ${toSmallCaps('limit')}
${global.dmenub2 || '┊'} Ⓞ = ${toSmallCaps('owner')}
${global.dmenub2 || '┊'} Ⓐ = ${toSmallCaps('admin')}
${global.dmenuf || '┗––––––––––✦'}
`.trim()

        const sections = [{
          title: `✨ Semua Kategori (${arrayMenu.length})`,
          highlight_label: '',
          rows: arrayMenu.map(v => ({
            header: '',
            title: `${global.pmenus || '📌'} ${formatTag(v)}`,
            description: `Lihat menu ${formatTag(v)}`,
            id: `${usedPrefix}${command} ${v}`
          }))
        }]

        await new ButtonV2(conn)
          .setTitle(`${botname}`)
          .setSubtitle('Menu Utama')
          .setBody(body)
          .setFooter('ʀyᴏ ʏᴀᴍᴀᴅᴀ - ᴍᴅ')
          .setThumbnail(mainBuffer)
          .addRawButton({
            buttonText: { displayText: '❏ List Menu' },
            buttonId: `${usedPrefix}${command}`,
            type: 1,
            nativeFlowInfo: {
              name: 'single_select',
              paramsJson: JSON.stringify({
                title: 'Pilih Kategori Menu',
                sections
              })
            }
          })
          .addButton('❏ Owner', `${usedPrefix}owner`)
          .send(m.chat)

        await playSound()
        return
      }
    }

    const targets = menuType === 'all' ? arrayMenu : [menuType]
    const detailText = buildCategoryText(targets)

    let hdThumbDetail = mainBuffer
    if (sharp) {
      hdThumbDetail = await sharp(mainBuffer)
        .resize(1280, 720)
        .jpeg({ quality: 100 })
        .toBuffer()
    }

    const { imageMessage: detailImage } = await prepareWAMessageMedia({
      image: hdThumbDetail
    }, {
      upload: conn.waUploadToServer,
      mediaTypeOverride: 'thumbnail-link'
    })

    detailImage.width = 1280
    detailImage.height = 720

    await conn.sendMessage(m.chat, {
      text: `${MENU_LINK}\n\n${detailText}`,
      linkPreview: {
        'matched-text': MENU_LINK,
        title: botname,
        description: 'WhatsApp Multi Device Bot',
        previewType: 0,
        jpegThumbnail: hdThumbDetail,
        highQualityThumbnail: detailImage,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('Menu error: ' + e.message)
  }
}

handler.command = /^(menu|help)$/i
handler.tags = ['main']
handler.help = ['menu']

export default handler