import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { xpRange } from '../../lib/levelling.js'
import path from 'path'

GlobalFonts.registerFromPath(path.join(process.cwd(), 'src/font/Futura Extra Black font.ttf'), 'NeoTitle')
GlobalFonts.registerFromPath(path.join(process.cwd(), 'src/font/Roboto-Bold.ttf'), 'NeoBold')
GlobalFonts.registerFromPath(path.join(process.cwd(), 'src/font/Roboto-Medium.ttf'), 'NeoRegular')

let handler = async (m, { conn, isOwner, isPrems }) => {
  let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  let user = global.db.data.users[who]
  if (!user) return m.reply('User tidak ditemukan.')

  let {
    level = 0,
    exp = 0,
    money = 0,
    limit = 0,
    role = 'Newbie',
    registered = false,
    name = '',
    age = '-',
    pasangan = '',
    jadian = false,
    jadianTime = 0
  } = user

  let { min, xp } = xpRange(level, global.multiplier || 1)

  let username = registered ? name : await conn.getName(who)

  let bio = 'Tidak ada bio'
  try {
    bio = (await conn.fetchStatus(who))?.status || 'Tidak ada bio'
  } catch {}

  let ppUrl
  try {
    ppUrl = await conn.profilePictureUrl(who, 'image')
  } catch {
    ppUrl = 'https://i.ibb.co/3kWbf3x/avatar-contact.png'
  }

  let status = isOwner ? 'Owner' : isPrems ? 'Premium' : 'Free User'
  let limitText = isPrems ? 'Unlimited' : limit.toLocaleString('id-ID')

  let pasanganText = 'Tidak Ada'
  let lamaJadian = '-'
  let tanggalJadian = '-'

  if (jadian && pasangan) {
    let waktuJadian = Date.now() - jadianTime
    let hari = Math.floor(waktuJadian / 86400000)
    let jam = Math.floor(waktuJadian / 3600000) % 24

    pasanganText = `@${pasangan.split('@')[0]}`
    lamaJadian = `${hari} Hari ${jam} Jam`
    tanggalJadian = new Date(jadianTime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const width = 850
  const height = 520
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  function drawNeubrutalCard(x, y, w, h, bgColor, radius = 16, shadowOffset = 6) {
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.roundRect(x + shadowOffset, y + shadowOffset, w, h, radius)
    ctx.fill()

    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, radius)
    ctx.fill()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  ctx.fillStyle = '#FAF3E0'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
  for (let i = 10; i < width; i += 20) {
    for (let j = 10; j < height; j += 20) {
      ctx.beginPath()
      ctx.arc(i, j, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawNeubrutalCard(20, 20, 810, 480, '#FFFFFF', 20, 8)

  drawNeubrutalCard(40, 40, 770, 70, '#FFD93D', 12, 5)
  ctx.fillStyle = '#000000'
  ctx.font = '28px "NeoTitle"'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('USER PROFILE', 60, 75)

  const statusColor = isOwner ? '#FF6B6B' : isPrems ? '#4D96FF' : '#6BCB77'
  drawNeubrutalCard(620, 52, 170, 42, statusColor, 8, 3)
  ctx.fillStyle = '#000000'
  ctx.font = '16px "NeoTitle"'
  ctx.textAlign = 'center'
  ctx.fillText(status.toUpperCase(), 705, 73)

  const avatarX = 50
  const avatarY = 135
  const avatarSize = 140

  drawNeubrutalCard(avatarX, avatarY, avatarSize, avatarSize, '#FF8AAE', 16, 5)

  try {
    const avatarImg = await loadImage(ppUrl)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 16)
    ctx.clip()
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, 16)
    ctx.stroke()
  } catch (e) {
    console.error(e)
  }

  ctx.textAlign = 'left'
  ctx.fillStyle = '#000000'
  ctx.font = '24px "NeoTitle"'
  ctx.fillText(username.length > 18 ? username.slice(0, 18) + '...' : username, 210, 160)

  ctx.font = '14px "NeoRegular"'
  ctx.fillStyle = '#333333'
  ctx.fillText(`" ${bio.length > 35 ? bio.slice(0, 35) + '...' : bio} "`, 210, 185)

  drawNeubrutalCard(210, 205, 140, 32, '#A855F7', 6, 2)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '13px "NeoTitle"'
  ctx.textAlign = 'center'
  ctx.fillText(`ROLE: ${role.toUpperCase()}`, 280, 221)

  drawNeubrutalCard(40, 290, 370, 190, '#E8F9FD', 12, 5)

  ctx.fillStyle = '#000000'
  ctx.font = '18px "NeoTitle"'
  ctx.textAlign = 'left'
  ctx.fillText('RPG STATS', 60, 320)

  ctx.font = '15px "NeoBold"'
  ctx.fillText(`Level    : ${level}`, 60, 355)
  ctx.fillText(`Money  : $ ${money.toLocaleString('id-ID')}`, 60, 385)
  ctx.fillText(`Limit    : ${limitText}`, 60, 415)

  const currentXp = exp - min
  const maxXp = xp
  const progressRatio = Math.min(Math.max(currentXp / maxXp, 0), 1)

  drawNeubrutalCard(60, 435, 330, 24, '#FFFFFF', 6, 2)
  if (progressRatio > 0) {
    ctx.fillStyle = '#FF6B6B'
    ctx.beginPath()
    ctx.roundRect(60, 435, Math.max(330 * progressRatio, 12), 24, 6)
    ctx.fill()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  ctx.fillStyle = '#000000'
  ctx.font = '12px "NeoBold"'
  ctx.textAlign = 'center'
  ctx.fillText(`XP: ${currentXp.toLocaleString('id-ID')} / ${maxXp.toLocaleString('id-ID')}`, 225, 448)

  drawNeubrutalCard(430, 290, 380, 190, '#FFECEC', 12, 5)

  ctx.fillStyle = '#000000'
  ctx.font = '18px "NeoTitle"'
  ctx.textAlign = 'left'
  ctx.fillText('RELATIONSHIP', 450, 320)

  ctx.font = '15px "NeoBold"'
  ctx.fillText(`Status     : ${jadian ? 'Berpacaran' : 'Jomblo'}`, 450, 355)
  ctx.fillText(`Pasangan : ${pasanganText}`, 450, 385)
  ctx.fillText(`Sejak      : ${tanggalJadian}`, 450, 415)
  ctx.fillText(`Bersama  : ${lamaJadian}`, 450, 445)

  const buffer = await canvas.toBuffer('image/png')

  let txt = `
🌷 *PROFILE USER*

❏ *Status:* ${status}
❏ *Nama:* ${username}
❏ *Umur:* ${registered ? age : '-'}
❏ *Role:* ${role}
❏ *Bio:* ${bio}

🎮 *RPG STATS*
❏ *Level:* ${level}
❏ *XP:* ${exp - min}/${xp}
❏ *Money:* ${money}
❏ *Limit:* ${limitText}

💞 *RELATIONSHIP*
❏ *Status:* ${jadian ? 'Berpacaran' : 'Jomblo'}
❏ *Pasangan:* ${pasanganText}
❏ *Sejak:* ${tanggalJadian}
❏ *Bersama:* ${lamaJadian}
`.trim()

  await conn.sendFile(
    m.chat,
    buffer,
    'profile.png',
    txt,
    m,
    false,
    {
      mentions: [who, ...(jadian && pasangan ? [pasangan] : [])]
    }
  )
}

handler.help = ['profile']
handler.tags = ['main']
handler.command = /^(profile|profil|me)$/i

export default handler