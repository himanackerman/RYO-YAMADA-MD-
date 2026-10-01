/**
 *  roblox stalk
 * -----------------------------
 * type   : plugins ESM
 * creator : hilman
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * source scrape : https://whatsapp.com/channel/0029Vb8JrC33GJP0ejgQFf22
 */

import axios from 'axios'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import path from 'node:path'
import fs from 'fs'

const FONT_NAME_PATH = path.join(process.cwd(), 'src', 'font', 'Roboto-Bold.ttf')
const FONT_TEXT_PATH = path.join(process.cwd(), 'src', 'font', 'Roboto-Medium.ttf')

let nameFont = 'Arial'
let textFont = 'Arial'

if (fs.existsSync(FONT_NAME_PATH)) {
  GlobalFonts.registerFromPath(FONT_NAME_PATH, 'QcNameFont')
  nameFont = 'QcNameFont'
}

if (fs.existsSync(FONT_TEXT_PATH)) {
  GlobalFonts.registerFromPath(FONT_TEXT_PATH, 'QcTextFont')
  textFont = 'QcTextFont'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} <username>`)

  await m.react('🕒')

  try {
    let json = await robloxStalk(text)
    if (!json) {
      await m.react('❌')
      return m.reply('❌ Gagal mengambil data. Username mungkin tidak ditemukan.')
    }

    let { account, presence, stats, badges } = json

    const canvas = createCanvas(800, 480)
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
    ctx.fillRect(0, 0, 800, 480)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
    for (let i = 10; i < 800; i += 20) {
      for (let j = 10; j < 480; j += 20) {
        ctx.beginPath()
        ctx.arc(i, j, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    drawNeubrutalCard(20, 20, 760, 440, '#FFFFFF', 20, 8)

    drawNeubrutalCard(40, 40, 720, 65, '#EF4444', 12, 5)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `26px "${nameFont}"`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('ROBLOX USER STALK', 60, 72)

    drawNeubrutalCard(580, 52, 160, 42, '#FFD93D', 8, 3)
    ctx.fillStyle = '#000000'
    ctx.font = `15px "${nameFont}"`
    ctx.textAlign = 'center'
    ctx.fillText('PLAYER CARD', 660, 73)

    drawNeubrutalCard(40, 125, 175, 210, '#E0F2FE', 12, 5)

    if (account.profilePicture) {
      try {
        const avatarImg = await loadImage(account.profilePicture)
        ctx.save()
        ctx.beginPath()
        ctx.roundRect(50, 135, 155, 190, 8)
        ctx.clip()
        ctx.drawImage(avatarImg, 50, 135, 155, 190)
        ctx.restore()
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.strokeRect(50, 135, 155, 190)
      } catch (e) {
        ctx.fillStyle = '#000000'
        ctx.font = `16px "${nameFont}"`
        ctx.textAlign = 'center'
        ctx.fillText('NO AVATAR', 127, 230)
      }
    } else {
      ctx.fillStyle = '#000000'
      ctx.font = `16px "${nameFont}"`
      ctx.textAlign = 'center'
      ctx.fillText('NO AVATAR', 127, 230)
    }

    drawNeubrutalCard(235, 125, 525, 210, '#FEF08A', 12, 5)
    ctx.fillStyle = '#000000'
    ctx.font = `16px "${nameFont}"`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('INFORMASI AKUN & STATISTIK', 255, 140)

    const userDisplay = account.username.length > 15 ? account.username.slice(0, 15) + '...' : account.username
    const displayDisplay = account.displayName.length > 15 ? account.displayName.slice(0, 15) + '...' : account.displayName

    ctx.font = `16px "${textFont}"`
    ctx.fillStyle = '#1E293B'
    ctx.fillText(`Username   : ${userDisplay}`, 255, 175)
    ctx.fillText(`Display    : ${displayDisplay}`, 255, 205)
    ctx.fillText(`Friends    : ${stats.friendCount}  |  Followers : ${stats.followers}`, 255, 235)
    ctx.fillText(`Following  : ${stats.following}`, 255, 265)
    ctx.fillText(`Verified   : ${account.hasVerifiedBadge ? 'Ya' : 'Tidak'}  |  Banned : ${account.isBanned ? 'Ya' : 'Tidak'}`, 255, 295)

    drawNeubrutalCard(40, 355, 720, 85, '#FFECEC', 12, 5)
    ctx.fillStyle = '#000000'
    ctx.font = `15px "${nameFont}"`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('PRESENCE & LOG :', 60, 368)

    ctx.font = `16px "${textFont}"`
    ctx.fillStyle = presence.isOnline ? '#16A34A' : '#DC2626'
    ctx.fillText(`Status Online : ${presence.isOnline ? 'ONLINE' : 'OFFLINE'}`, 60, 395)

    const image = await canvas.toBuffer('image/png')

    let caption = `— *ROBLOX USER STALK* —

❀ *username* : ${account.username}
❀ *display name* : ${account.displayName}
❀ *created* : ${account.created}
❀ *description* : ${account.description}
❀ *verified* : ${account.hasVerifiedBadge ? 'Ya' : 'Tidak'}
❀ *banned* : ${account.isBanned ? 'Ya' : 'Tidak'}

❀ *presence* :
- online : ${presence.isOnline ? 'Ya' : 'Tidak'}
- last online : ${presence.lastOnline}
- location : ${presence.location}

❀ *stats* :
- friends : ${stats.friendCount}
- followers : ${stats.followers}
- following : ${stats.following}\n\n`

    if (badges.length) {
      caption += `❀ *recent badges* :\n`
      badges.forEach((b, i) => {
        caption += `${i + 1}. ${b.name}\n`
      })
    }

    await m.react('✅')
    await conn.sendFile(m.chat, image, 'robloxstalk.png', caption.trim(), m)
  } catch (err) {
    console.error(err)
    await m.react('❌')
    m.reply('❌ Terjadi kesalahan saat mengambil data Roblox.')
  }
}

handler.help = ['robloxstalk <username>']
handler.tags = ['stalk']
handler.command = /^robloxstalk$/i
handler.limit = true

export default handler

async function robloxStalk(username) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: 'application/json',
    }

    const getUsernameData = async () => {
      const res = await axios.post('https://users.roblox.com/v1/usernames/users', { usernames: [username] }, { headers })
      return res.data?.data?.[0] || null
    }

    const getUserData = id => axios.get(`https://users.roblox.com/v1/users/${id}`, { headers }).then(res => res.data).catch(() => ({}))
    const getProfile = id => axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=720x720&format=Png&isCircular=false`, { headers }).then(res => res.data?.data?.[0]?.imageUrl || null).catch(() => null)
    const getPresence = id => axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [id] }, { headers }).then(res => {
      const p = res.data?.userPresences?.[0] || {}
      return {
        isOnline: p.userPresenceType === 2,
        lastOnline: p.lastOnline || 'Tidak tersedia',
        location: p.lastLocation || 'Tidak sedang bermain apa pun (offline)'
      }
    }).catch(() => ({ isOnline: false, lastOnline: 'Tidak tersedia', location: 'Tidak sedang bermain apa pun (offline)' }))

    const getFriendCount = id => axios.get(`https://friends.roblox.com/v1/users/${id}/friends/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getFollowers = id => axios.get(`https://friends.roblox.com/v1/users/${id}/followers/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getFollowing = id => axios.get(`https://friends.roblox.com/v1/users/${id}/followings/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getBadges = id => axios.get(`https://badges.roblox.com/v1/users/${id}/badges?limit=10&sortOrder=Desc`, { headers }).then(res => res.data?.data?.map(b => ({ name: b.name, description: b.description, iconImageId: b.iconImageId })) || []).catch(() => [])

    const userData = await getUsernameData()
    if (!userData) throw new Error('Username tidak ditemukan.')

    const id = userData.id
    const [userDetails, profilePicture, presence, friendCount, followers, following, badges] = await Promise.all([
      getUserData(id),
      getProfile(id),
      getPresence(id),
      getFriendCount(id),
      getFollowers(id),
      getFollowing(id),
      getBadges(id)
    ])

    return {
      account: {
        username: userDetails.name,
        displayName: userDetails.displayName,
        profilePicture,
        description: userDetails.description || '-',
        created: userDetails.created,
        isBanned: userDetails.isBanned || false,
        hasVerifiedBadge: userDetails.hasVerifiedBadge || false,
      },
      presence,
      stats: {
        friendCount,
        followers,
        following
      },
      badges
    }
  } catch (err) {
    console.error('[ROBLOX STALK ERROR]', err.response?.status, err.response?.data || err.message)
    return null
  }
}
