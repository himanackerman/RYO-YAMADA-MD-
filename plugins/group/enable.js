let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /^(enable|on)$/i.test(command)

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.settings = global.db.data.settings || {}

  let chat = global.db.data.chats[m.chat]
  if (!chat) chat = global.db.data.chats[m.chat] = {}

  // FIX: settings bot (self/public/pconly/gconly/autoread) disimpan per-jid di db, bukan cuma di global.opts
  let botSettings = global.db.data.settings[conn.user.jid]
  if (!botSettings) botSettings = global.db.data.settings[conn.user.jid] = {}

  if (!('welcome' in chat)) chat.welcome = true
  if (!('delete' in chat)) chat.delete = true
  if (!('antiDelete' in chat)) chat.antiDelete = false
  if (!('antiLink' in chat)) chat.antiLink = false
  if (!('antiMedia' in chat)) chat.antiMedia = false
  if (!('antiBadword' in chat)) chat.antiBadword = false
  if (!('autogpt' in chat)) chat.autogpt = false
  if (!('autosimi' in chat)) chat.autosimi = false
  if (!('autodl' in chat)) chat.autodl = false
  if (!('antiPromosi' in chat)) chat.antiPromosi = false
  if (!('detect' in chat)) chat.detect = true
  if (!('rpgs' in chat)) chat.rpgs = true
  if (!('autolevelup' in chat)) chat.autolevelup = false
  if (global.autocorrect === undefined)
  global.autocorrect = true

  let type = (args[0] || '').toLowerCase()
  let isAll = false

  switch (type) {
    case 'welcome':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.welcome = isEnable
      break

    case 'delete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.delete = isEnable
      break

    case 'antidelete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiDelete = isEnable
      break

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable
      break

    case 'antibadword':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiBadword = isEnable
      break
   case 'antipromosi':
  if (m.isGroup && !(isAdmin || isOwner))
    return global.dfail('admin', m, conn)
  chat.antiPromosi = isEnable
  break
  case 'antimedia':
  if (m.isGroup && !(isAdmin || isOwner))
    return global.dfail('admin', m, conn)
  chat.antiMedia = isEnable
  break
    case 'autogpt':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.autogpt = isEnable
      break
   case 'autosimi':
  if (m.isGroup && !(isAdmin || isOwner))
    return global.dfail('admin', m, conn)
  chat.autosimi = isEnable
  break   
  case 'autodl':
  if (m.isGroup && !(isAdmin || isOwner))
    return global.dfail('admin', m, conn)
  chat.autodl = isEnable
  break
    case 'detect':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'rpg':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.rpgs = isEnable
      break

    case 'autolevelup':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      chat.autolevelup = isEnable
      break
    case 'autocorrect':
  isAll = true
  if (!isROwner) return global.dfail('rowner', m, conn)
  global.autocorrect = isEnable
  break

    case 'public':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.self = !isEnable
      botSettings.self = global.opts.self // FIX: persist ke db biar nggak reset pas restart
      break

    case 'autoread':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.autoread = isEnable
      botSettings.autoread = global.opts.autoread // FIX: persist ke db
      break

    case 'pconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.pconly = isEnable
      botSettings.pconly = global.opts.pconly // FIX: persist ke db
      break

    case 'gconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.gconly = isEnable
      botSettings.gconly = global.opts.gconly // FIX: persist ke db
      break

    case 'self':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts.self = isEnable
      botSettings.self = global.opts.self // FIX: persist ke db
      break

    default: {
      let totalOn = [
        chat.welcome,
        chat.delete,
        chat.antiDelete,
        chat.antiLink,
        chat.antiBadword,
        chat.antiPromosi,
        chat.antiMedia,
        chat.detect,
        chat.autogpt,
        chat.autosimi,
        chat.autodl,
        chat.rpgs,
        !global.opts.self,
        global.opts.self,
        global.opts.autoread,
        global.opts.pconly,
        global.opts.gconly,
        chat.autolevelup,
        global.autocorrect
      ].filter(Boolean).length

      return m.reply(`
Settings Bot

[  GROUP  ]

❏ Welcome      : ${chat.welcome ? '✅' : '❌'}
❏ Delete       : ${chat.delete ? '✅' : '❌'}
❏ AntiDelete   : ${chat.antiDelete ? '✅' : '❌'}
❏ AntiLink     : ${chat.antiLink ? '✅' : '❌'}
❏ AntiBadword  : ${chat.antiBadword ? '✅' : '❌'}
❏ AntiPromosi  : ${chat.antiPromosi ? '✅' : '❌'}
❏ AntiMedia    : ${chat.antiMedia ? '✅' : '❌'}
❏ Detect       : ${chat.detect ? '✅' : '❌'}
❏ AutoGPT      : ${chat.autogpt ? '✅' : '❌'}
❏ AutoSimi     : ${chat.autosimi ? '✅' : '❌'}
❏ AutoDL       : ${chat.autodl ? '✅' : '❌'}
❏ RPG          : ${chat.rpgs ? '✅' : '❌'}

[  OWNER  ]

❏ Public       : ${!global.opts.self ? '✅' : '❌'}
❏ Self         : ${global.opts.self ? '✅' : '❌'}
❏ AutoRead     : ${global.opts.autoread ? '✅' : '❌'}
❏ PC Only      : ${global.opts.pconly ? '✅' : '❌'}
❏ GC Only      : ${global.opts.gconly ? '✅' : '❌'}
❏ AutoLevelUp  : ${chat.autolevelup ? '✅' : '❌'}
❏ AutoCorrect  : ${global.autocorrect ? '✅' : '❌'}

Status : ${totalOn} fitur aktif

Example:
${usedPrefix}enable antilink 
${usedPrefix}disable antilink 
`.trim())
    }
  }

  let target = isAll
    ? 'untuk bot ini'
    : m.isGroup
      ? 'untuk grup ini'
      : 'untuk chat ini'

  await global.db.write?.().catch(() => null)

  m.reply(`✅ Berhasil ${isEnable ? 'mengaktifkan' : 'menonaktifkan'} *${type}* ${target}`)
}

handler.help = ['enable', 'disable']
handler.tags = ['group', 'owner']
handler.command = /^(enable|disable|on|off)$/i

export default handler