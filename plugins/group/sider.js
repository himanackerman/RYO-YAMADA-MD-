import fs from 'fs'
import path from 'path'

function msToDate(ms) {
  if (isNaN(ms) || ms < 0) return '--'
  let d = Math.floor(ms / 864e5)
  let h = Math.floor(ms / 36e5) % 24
  let m = Math.floor(ms / 6e4) % 60
  if (d === 0 && h === 0 && m === 0) return 'Baru Saja'
  return `${String(d).padStart(2, '0')}H ${String(h).padStart(2, '0')}J`
}

async function resolvePn(rawId, participant, conn) {
  if (!rawId || typeof rawId !== 'string') return ''
  if (participant?.phoneNumber) {
    let num = String(participant.phoneNumber).replace(/[^0-9]/g, '')
    if (num) return `${num}@s.whatsapp.net`
  }
  if (participant?.jid && participant.jid.endsWith('@s.whatsapp.net')) {
    return participant.jid
  }
  if (rawId.endsWith('@s.whatsapp.net')) {
    return rawId
  }
  if (rawId.endsWith('@lid')) {
    try {
      const found = await conn.findUserId(rawId)
      if (found?.phoneNumber && found.phoneNumber !== 'id-not-found') {
        let pn = conn.decodeJid(found.phoneNumber)
        if (pn && pn.endsWith('@s.whatsapp.net')) return pn
      }
    } catch {}

    try {
      const lidUser = rawId.split('@')[0].split(':')[0]
      const revFile = path.join('./sessions', `lid-mapping-${lidUser}_reverse.json`)
      if (fs.existsSync(revFile)) {
        const pnNum = JSON.parse(fs.readFileSync(revFile, 'utf8'))
        if (pnNum) return `${pnNum}@s.whatsapp.net`
      }
    } catch {}
  }
  return rawId
}

const handler = async (m, { conn, text, groupMetadata }) => {
  await conn.sendPresenceUpdate('composing', m.chat)

  const milliseconds = Date.now()
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000

  const participants = groupMetadata?.participants || []
  const sum = participants.length
  if (!sum) {
    return await conn.reply(m.chat, '*Gagal memuat daftar anggota grup.*', m)
  }

  const pesan = (text && text.trim())
    ? text.trim()
    : 'Harap aktif di grup karena akan ada pembersihan member setiap saat'

  const groupName = (await conn.getName(m.chat).catch(() => '')) || groupMetadata?.subject || 'Grup'

  const botNumber = (conn.user?.id || conn.user?.jid || '').split('@')[0].split(':')[0]
  const owners = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).replace(/[^0-9]/g, ''))

  const sider = []

  for (const p of participants) {
    const rawId = p.id || p.jid || ''
    const pnJid = await resolvePn(rawId, p, conn)

    const isAdmin = Boolean(
      p.admin === 'admin' ||
      p.admin === 'superadmin' ||
      p.isAdmin ||
      p.isSuperAdmin ||
      (groupMetadata?.owner && (rawId === groupMetadata.owner || pnJid === groupMetadata.owner))
    )

    const isBot = Boolean(
      (botNumber && (rawId.startsWith(botNumber) || pnJid.startsWith(botNumber))) ||
      (conn.user?.id && (rawId === conn.user.id || pnJid === conn.user.id))
    )

    const isOwner = owners.some(o => o && (rawId.startsWith(o) || pnJid.startsWith(o)))

    if (isAdmin || isBot || isOwner) continue

    const userData = global.db.data?.users?.[pnJid] || global.db.data?.users?.[rawId]
    const lastseen = userData?.lastseen || 0
    const isBanned = Boolean(userData?.banned)
    const isInactive = isBanned || !lastseen || (milliseconds - lastseen > ONE_WEEK)

    if (isInactive) {
      sider.push({
        rawId,
        pnJid,
        lastseen
      })
    }
  }

  if (sider.length === 0) {
    return await conn.reply(m.chat, '*Di grup ini tidak terdapat sider.*', m)
  }

  const listSider = sider.map(s => {
    const num = s.pnJid.split('@')[0]
    const status = !s.lastseen ? 'Sider' : `Off ${msToDate(milliseconds - s.lastseen)}`
    return `  ○ @${num} ${status}`
  }).join('\n')

  const caption = `*${sider.length}/${sum}* anggota grup *${groupName}* adalah sider dengan alasan :\n` +
    `1. Tidak aktif selama lebih dari 7 hari\n` +
    `2. Baru join tetapi tidak pernah nimbrung\n\n` +
    `_“${pesan}”_\n\n` +
    `*LIST SIDER :*\n` +
    `${listSider}`

  const mentions = sider.flatMap(s => [s.pnJid, s.rawId].filter(Boolean))

  await conn.reply(m.chat, caption, m, { mentions })
}

handler.help = ['gcsider']
handler.tags = ['group']
handler.command = /^(gcsider|sider|getsider)$/i
handler.group = true
handler.admin = true

export default handler
