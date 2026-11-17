export const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const WISHES = [
  'Selamat ulang tahun! Semoga di usiamu yang baru ini, setiap langkahmu dipenuhi keberkahan, kebahagiaan, kesehatan, dan semua impianmu terwujud nyata! 🎉🎂✨',
  'Happy Birthday! Semoga panjang umur, murah rezeki, senantiasa dilindungi Tuhan, dan hari-harimu selalu dikelilingi orang-orang tersayang! 🥳🎈🎁',
  'Selamat bertambah usia! Semoga semakin dewasa, semakin sukses dalam segala hal yang kamu usahakan, dan selalu diberi kebahagiaan lahir batin! 🎂🌟💖',
  'Barakallah fii umrik! Semoga berkah sisa usianya, selalu dalam lindungan dan rahmat-Nya, serta dipermudah segala urusannya di dunia dan akhirat! 🤲🎂✨',
  'Happy Level Up Day! 🎮 Semoga tahun ini menjadi tahun terbaikmu dengan banyak petualangan seru dan pencapaian baru yang membanggakan! 🚀🎉🍰'
]

export function getZodiac(day, month) {
  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return 'Capricorn ♑'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒'
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces ♓'
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐'
  return 'Unknown'
}

export function parseDateInput(str) {
  if (!str) return null
  const cleaned = str.trim().replace(/[/\. ]/g, '-')
  const parts = cleaned.split('-').map(v => parseInt(v, 10)).filter(v => !isNaN(v))
  if (parts.length === 2) {
    const [day, month] = parts
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month, year: null }
    }
  } else if (parts.length === 3) {
    let [day, month, year] = parts
    if (day > 1000 && year <= 31) {
      const temp = day
      day = year
      year = temp
    }
    const currentYear = new Date().getFullYear()
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1940 && year <= currentYear) {
      return { day, month, year }
    }
  }
  return null
}

export function getBirthdayDetails(day, month, year = null) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const currentYear = now.getFullYear()
  const today = new Date(currentYear, now.getMonth(), now.getDate())

  let nextBday = new Date(currentYear, month - 1, day)
  if (nextBday < today) {
    nextBday = new Date(currentYear + 1, month - 1, day)
  }

  const diffTime = nextBday.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  let age = null
  if (year) {
    age = currentYear - year
    const bdayThisYear = new Date(currentYear, month - 1, day)
    if (today < bdayThisYear) {
      age -= 1
    }
  }

  const dateStr = year ? `${day} ${MONTH_NAMES[month]} ${year}` : `${day} ${MONTH_NAMES[month]}`
  const nextDateStr = `${day} ${MONTH_NAMES[month]} ${nextBday.getFullYear()}`
  const zodiac = getZodiac(day, month)

  return {
    day,
    month,
    year,
    dateStr,
    nextDateStr,
    zodiac,
    diffDays,
    isToday: diffDays === 0,
    age: age !== null ? Math.max(0, age) : null
  }
}

async function resolveUserData(conn, jid) {
  if (!jid) return { jid, user: null }
  let user = global.db.data?.users?.[jid]
  if (user?.birthday && typeof user.birthday === 'object') return { jid, user }

  if (conn?.findUserId) {
    try {
      const res = await conn.findUserId(jid)
      if (res?.phoneNumber && res.phoneNumber !== 'id-not-found') {
        const uPN = global.db.data?.users?.[res.phoneNumber]
        if (uPN?.birthday && typeof uPN.birthday === 'object') {
          return { jid: res.phoneNumber, user: uPN }
        }
        if (!user && uPN) user = uPN
      }
      if (res?.lid && res.lid !== 'id-not-found') {
        const uLID = global.db.data?.users?.[res.lid]
        if (uLID?.birthday && typeof uLID.birthday === 'object') {
          return { jid: res.lid, user: uLID }
        }
        if (!user && uLID) user = uLID
      }
    } catch {}
  }

  return { jid, user }
}

let isRunning = false

setInterval(async () => {
  if (isRunning) return
  if (!global.conn || !global.conn.user || !global.db?.data?.chats || !global.db?.data?.users) return

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const currentHour = now.getHours()
  const todayDay = now.getDate()
  const todayMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const dateKey = `${todayDay}-${todayMonth}-${currentYear}`

  if (currentHour < 7) return

  isRunning = true
  try {
    const chats = global.db.data.chats
    const groupJids = Object.keys(chats).filter(jid => jid.endsWith('@g.us'))

    for (const jid of groupJids) {
      const chat = chats[jid]
      if (!chat) continue
      if (chat.isBanned) continue
      if (chat.lastBirthdayNotif === dateKey) continue

      chat.lastBirthdayNotif = dateKey

      let participants = []
      try {
        const meta = await global.conn.groupMetadata(jid)
        participants = meta?.participants || []
      } catch (err) {
        continue
      }

      if (!participants.length) continue

      const todayBirthdays = []
      const tomorrowBirthdays = []

      for (const p of participants) {
        const { jid: targetJid, user: u } = await resolveUserData(global.conn, p.id)
        if (!u?.birthday || typeof u.birthday !== 'object') continue

        const b = u.birthday
        if (!b.day || !b.month) continue

        const details = getBirthdayDetails(b.day, b.month, b.year)
        if (details.isToday) {
          todayBirthdays.push({
            jid: targetJid,
            ...details
          })
        } else if (details.diffDays === 1) {
          tomorrowBirthdays.push({
            jid: targetJid,
            ...details
          })
        }
      }

      if (todayBirthdays.length > 0 || tomorrowBirthdays.length > 0) {
        let caption = `*\`PENGINGAT ULANG TAHUN\`* 🎂\n\n`
        const mentions = []

        if (todayBirthdays.length > 0) {
          caption += `🎉 *HARI INI ADA YANG ULANG TAHUN!* 🎉\n`
          caption += `Yuk berikan ucapan dan doa terbaik untuk member kita:\n\n`

          for (const b of todayBirthdays) {
            mentions.push(b.jid)
            const ageStr = b.age !== null ? ` (${b.age} Tahun)` : ''
            caption += `✿ Member : @${b.jid.split('@')[0]}${ageStr}\n`
            caption += `✿ Zodiak : ${b.zodiac}\n`
            caption += `✿ Doa    : Semoga panjang umur, sehat selalu, banyak rezeki, dan segala impian tercapai! 🥳🎈\n\n`
          }

          caption += `Ketik: *.wishultah @user [pesan]* untuk mengirim ucapan spesial!\n\n`
        }

        if (tomorrowBirthdays.length > 0) {
          caption += `📅 *Besok Ada yang Mau Ultah (H-1):*\n`
          for (const b of tomorrowBirthdays) {
            mentions.push(b.jid)
            const ageStr = b.age !== null ? ` (ke-${b.age + 1})` : ''
            caption += `• @${b.jid.split('@')[0]}${ageStr} — Besok!\n`
          }
          caption += `\nSiap-siap beri ucapan ya teman-teman! ✨\n`
        }

        try {
          await global.conn.sendMessage(jid, {
            text: caption.trim(),
            mentions
          })
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (e) {
          console.error(`Gagal kirim notif ultah ke ${jid}:`, e)
        }
      }
    }
  } catch (err) {
    console.error('Birthday scheduler error:', err)
  } finally {
    isRunning = false
  }
}, 60000)

export async function before(m) {
  if (!m.isGroup || m.fromMe || m.isBaileys) return false
  if (!m.sender) return false

  const text = (m.text || '').trim()
  if (text.startsWith('.') || text.startsWith('#') || text.startsWith('/') || text.startsWith('!')) return false

  const { user } = await resolveUserData(this, m.sender)
  if (!user?.birthday || typeof user.birthday !== 'object') return false

  const b = user.birthday
  if (!b.day || !b.month) return false

  const details = getBirthdayDetails(b.day, b.month, b.year)
  if (!details.isToday) return false

  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const currentYear = now.getFullYear()

  if (user.lastBirthdayWished === currentYear) return false

  user.lastBirthdayWished = currentYear
  user.limit = (user.limit || 0) + 100
  user.exp = (user.exp || 0) + 5000

  const senderTag = (m.senderPN || m.sender).split('@')[0]
  let caption = `*\`HAPPY BIRTHDAY!\`* 🎂🎉\n\n`
  caption += `Selamat ulang tahun @${senderTag}! 🥳✨\n`
  if (details.age !== null) {
    caption += `Selamat bertambah usia yang ke-${details.age} tahun!\n`
  }
  caption += `Semoga di usiamu yang baru ini selalu dilimpahi kesehatan, kebahagiaan, dan kemudahan dalam segala urusan! 💖\n\n`
  caption += `🎁 *Kado Ulang Tahun dari Bot:*\n`
  caption += `✿ +100 Limit\n`
  caption += `✿ +5.000 EXP\n\n`
  caption += `_(Kado sudah otomatis masuk ke akunmu!)_`

  try {
    await this.reply(m.chat, caption, m, {
      mentions: [m.senderPN || m.sender]
    })
  } catch (e) {
    console.error('Error reply birthday wish:', e)
  }

  return false
}

let handler = async (m, { conn, text, args, usedPrefix, command, groupMetadata }) => {
  const cmd = command.toLowerCase()
  const subCmd = args[0]?.toLowerCase()

  if (cmd === 'setultah' || (cmd === 'ultah' && subCmd === 'set')) {
    const inputDate = cmd === 'setultah' ? text : args.slice(1).join(' ')
    const parsed = parseDateInput(inputDate)

    if (!parsed) {
      return m.reply(
        `*\`Pengaturan Ulang Tahun\`*\n\n` +
        `✿ Format : *${usedPrefix + command} DD-MM-YYYY*\n` +
        `✿ Contoh : *${usedPrefix + command} 15-05-2005*\n` +
        `✿ Catatan : Bisa juga tanpa tahun, contoh: *${usedPrefix + command} 15-05*`
      )
    }

    const details = getBirthdayDetails(parsed.day, parsed.month, parsed.year)
    const senderPN = m.senderPN || m.sender
    let user = global.db.data.users[m.sender] || (global.db.data.users[senderPN] = global.db.data.users[senderPN] || {})

    const bdayData = {
      day: parsed.day,
      month: parsed.month,
      year: parsed.year,
      dateStr: details.dateStr,
      zodiac: details.zodiac
    }

    user.birthday = bdayData
    if (global.db.data.users[senderPN]) global.db.data.users[senderPN].birthday = bdayData
    if (global.db.data.users[m.sender]) global.db.data.users[m.sender].birthday = bdayData

    if (conn?.findUserId) {
      try {
        const res = await conn.findUserId(m.sender)
        if (res?.phoneNumber && res.phoneNumber !== 'id-not-found' && global.db.data.users[res.phoneNumber]) {
          global.db.data.users[res.phoneNumber].birthday = bdayData
        }
        if (res?.lid && res.lid !== 'id-not-found' && global.db.data.users[res.lid]) {
          global.db.data.users[res.lid].birthday = bdayData
        }
      } catch {}
    }

    if (details.age !== null) {
      user.age = details.age
      if (global.db.data.users[senderPN]) global.db.data.users[senderPN].age = details.age
    }

    let caption = `*\`Ulang Tahun Berhasil Disimpan\`*\n\n`
    caption += `✿ Tanggal Lahir : ${details.dateStr}\n`
    if (details.age !== null) {
      caption += `✿ Usia Sekarang : ${details.age} Tahun\n`
    }
    caption += `✿ Zodiak        : ${details.zodiac}\n`
    caption += `✿ Ultah Berikut : ${details.nextDateStr}\n`

    if (details.isToday) {
      const currentYear = new Date().getFullYear()
      if (user.lastBirthdayWished !== currentYear) {
        user.lastBirthdayWished = currentYear
        user.limit = (user.limit || 0) + 100
        user.exp = (user.exp || 0) + 5000
        caption += `✿ Hitung Mundur : 🎉 *HARI INI! Selamat Ulang Tahun!*\n\n`
        caption += `🎁 *Kado Spesial Bot:* +100 Limit & +5.000 EXP ditambahkan ke akunmu!`
      } else {
        caption += `✿ Hitung Mundur : 🎉 *HARI INI! Selamat Ulang Tahun!*`
      }
    } else {
      caption += `✿ Hitung Mundur : ${details.diffDays} Hari Lagi`
    }

    await m.react('🎂')
    return m.reply(caption)
  }

  if (cmd === 'delultah' || (cmd === 'ultah' && ['del', 'delete', 'hapus'].includes(subCmd))) {
    const senderPN = m.senderPN || m.sender
    const { user } = await resolveUserData(conn, m.sender)
    if (!user?.birthday) {
      return m.reply('Kamu belum mengatur tanggal ulang tahun.')
    }

    delete user.birthday
    if (global.db.data.users[senderPN]) delete global.db.data.users[senderPN].birthday
    if (global.db.data.users[m.sender]) delete global.db.data.users[m.sender].birthday
    if (conn?.findUserId) {
      try {
        const res = await conn.findUserId(m.sender)
        if (res?.phoneNumber && global.db.data.users[res.phoneNumber]) delete global.db.data.users[res.phoneNumber].birthday
        if (res?.lid && global.db.data.users[res.lid]) delete global.db.data.users[res.lid].birthday
      } catch {}
    }

    await m.react('🗑️')
    return m.reply(
      `*\`Ulang Tahun Dihapus\`*\n\n` +
      `✿ Status : Data ulang tahunmu berhasil dihapus.\n` +
      `✿ Info   : Ketik *${usedPrefix}setultah DD-MM-YYYY* untuk mengatur ulang.`
    )
  }

  if (cmd === 'listultah' || (cmd === 'ultah' && ['list', 'daftar'].includes(subCmd))) {
    let participantSet = new Set()
    let isGroupChat = m.isGroup

    if (isGroupChat) {
      let participants = groupMetadata?.participants || []
      if (!participants.length) {
        try {
          const meta = await conn.groupMetadata(m.chat)
          participants = meta?.participants || []
        } catch {}
      }

      for (const p of participants) {
        if (p.id) participantSet.add(p.id)
        if (p.jid) participantSet.add(p.jid)
        if (p.id?.endsWith('@lid') && conn?.findUserId) {
          try {
            const res = await conn.findUserId(p.id)
            if (res?.phoneNumber && res.phoneNumber !== 'id-not-found') {
              participantSet.add(res.phoneNumber)
            }
          } catch {}
        }
      }
    }

    let bdayList = []
    const seen = new Set()

    for (const [jid, u] of Object.entries(global.db.data?.users || {})) {
      if (!u?.birthday || typeof u.birthday !== 'object') continue

      let bestJid = jid
      let isMember = !isGroupChat

      if (isGroupChat) {
        if (participantSet.has(jid)) {
          isMember = true
        } else if (conn?.findUserId) {
          try {
            const res = await conn.findUserId(jid)
            if ((res?.phoneNumber && participantSet.has(res.phoneNumber)) || (res?.lid && participantSet.has(res.lid))) {
              isMember = true
              if (res?.phoneNumber && res.phoneNumber !== 'id-not-found') bestJid = res.phoneNumber
            }
          } catch {}
        }
      }

      if (isMember) {
        if (bestJid.endsWith('@lid') && conn?.findUserId) {
          try {
            const res = await conn.findUserId(bestJid)
            if (res?.phoneNumber && res.phoneNumber !== 'id-not-found') bestJid = res.phoneNumber
          } catch {}
        }

        const tagKey = bestJid.split('@')[0]
        if (!seen.has(tagKey)) {
          seen.add(tagKey)
          const b = u.birthday
          const details = getBirthdayDetails(b.day, b.month, b.year)
          const name = u.name || tagKey
          bdayList.push({
            jid: bestJid,
            name,
            ...details
          })
        }
      }
    }

    if (!bdayList.length) {
      return m.reply(
        `*\`Daftar Ulang Tahun\`*\n\n` +
        `Belum ada member yang menyetel tanggal ulang tahun.\n` +
        `Ketik *${usedPrefix}setultah DD-MM-YYYY* untuk mendaftarkan ulang tahunmu!`
      )
    }

    bdayList.sort((a, b) => a.diffDays - b.diffDays)

    const todayList = bdayList.filter(b => b.isToday)
    const upcomingList = bdayList.filter(b => !b.isToday).slice(0, 15)

    let caption = `*\`Daftar Ulang Tahun Member\`*\n\n`
    const mentions = []

    if (todayList.length > 0) {
      caption += `🎂 *SEDANG ULANG TAHUN HARI INI:*\n`
      for (const b of todayList) {
        mentions.push(b.jid)
        const ageStr = b.age !== null ? ` (${b.age} th)` : ''
        caption += `• @${b.jid.split('@')[0]}${ageStr} — ${b.zodiac}\n`
      }
      caption += `\n`
    }

    if (upcomingList.length > 0) {
      caption += `📅 *AKAN DATANG:*\n`
      upcomingList.forEach((b, idx) => {
        mentions.push(b.jid)
        const ageStr = b.age !== null ? ` (ke-${b.age + 1})` : ''
        caption += `${idx + 1}. @${b.jid.split('@')[0]} : ${b.day} ${MONTH_NAMES[b.month]} (${b.diffDays} hari lagi)${ageStr}\n`
      })
    }

    caption += `\n✿ Total terdaftar: ${bdayList.length} member`

    return conn.sendMessage(m.chat, {
      text: caption.trim(),
      mentions
    }, { quoted: m })
  }

  if (cmd === 'wishultah' || cmd === 'ucapanultah') {
    let whoRaw = m.mentionedJidPN?.[0] || m.mentionedJid?.[0] || m.quotedSenderPN || m.quoted?.sender
    if (!whoRaw) {
      return m.reply(
        `*\`Ucapan Ulang Tahun\`*\n\n` +
        `✿ Format : *${usedPrefix + command} @user [pesan custom]*\n` +
        `✿ Contoh : *${usedPrefix + command} @628123456789 Selamat ulang tahun kawan!*`
      )
    }

    const { jid: who } = await resolveUserData(conn, whoRaw)
    const customMessage = args.filter(v => !v.startsWith('@')).join(' ').trim()
    const wishText = customMessage || WISHES[Math.floor(Math.random() * WISHES.length)]
    const senderWho = m.senderPN || m.sender

    let textOut = `🎂 *SELAMAT ULANG TAHUN!* 🎂\n\n`
    textOut += `*To : @${who.split('@')[0]}*\n\n`
    textOut += `"${wishText}"\n\n`
    textOut += `✿ Dari : @${senderWho.split('@')[0]}`

    await m.react('🎉')
    return conn.sendMessage(m.chat, {
      text: textOut.trim(),
      mentions: [who, senderWho]
    }, { quoted: m })
  }

  let whoRaw = m.mentionedJidPN?.[0] || m.mentionedJid?.[0] || m.quotedSenderPN || m.quoted?.sender || m.senderPN || m.sender
  const isSelf = whoRaw === m.sender || whoRaw === m.senderPN
  const { jid: resolvedJid, user } = await resolveUserData(conn, whoRaw)
  const who = resolvedJid || whoRaw

  if (!user?.birthday) {
    if (isSelf) {
      return m.reply(
        `*\`Informasi Ulang Tahun\`*\n\n` +
        `✿ Status : Belum Disetel\n` +
        `✿ Info   : Kamu belum menyetel tanggal ulang tahun.\n` +
        `✿ Cara   : Ketik *${usedPrefix}setultah DD-MM-YYYY*\n` +
        `✿ Contoh : *${usedPrefix}setultah 15-05-2005*`
      )
    } else {
      return m.reply(`@${who.split('@')[0]} belum menyetel tanggal ulang tahunnya.`, { mentions: [who] })
    }
  }

  const b = user.birthday
  const details = getBirthdayDetails(b.day, b.month, b.year)
  const displayName = user.name || who.split('@')[0]

  if (details.isToday) {
    let caption = `🎉 *HARI INI ULANG TAHUN!* 🎉\n\n`
    caption += `*\`Happy Birthday, ${displayName}!\`*\n\n`
    caption += `✿ Nama   : @${who.split('@')[0]}\n`
    if (details.age !== null) {
      caption += `✿ Usia   : ${details.age} Tahun 🎂\n`
    }
    caption += `✿ Zodiak : ${details.zodiac}\n\n`
    caption += `Selamat ulang tahun @${who.split('@')[0]}! Semoga panjang umur, sehat selalu, rezeki melimpah, dan sukses dalam segala impianmu! 🎂🎈🎁✨`

    await m.react('🥳')
    return conn.sendMessage(m.chat, {
      text: caption.trim(),
      mentions: [who]
    }, { quoted: m })
  }

  let caption = `*\`Informasi Ulang Tahun\`*\n\n`
  caption += `✿ Nama          : @${who.split('@')[0]}\n`
  caption += `✿ Tanggal Lahir : ${details.dateStr}\n`
  if (details.age !== null) {
    caption += `✿ Usia Sekarang : ${details.age} Tahun\n`
  }
  caption += `✿ Zodiak        : ${details.zodiac}\n`
  caption += `✿ Ultah Berikut : ${details.nextDateStr}\n`
  caption += `✿ Sisa Waktu    : ${details.diffDays} Hari Lagi`

  await m.react('🎂')
  return conn.sendMessage(m.chat, {
    text: caption.trim(),
    mentions: [who]
  }, { quoted: m })
}

handler.help = [
  'ultah [@user]',
  'setultah <DD-MM-YYYY>',
  'listultah',
  'wishultah @user',
  'delultah'
]
handler.tags = ['main']
handler.command = /^(ultah|birthday|setultah|delultah|listultah|wishultah|ucapanultah)$/i
handler.before = before

export default handler
