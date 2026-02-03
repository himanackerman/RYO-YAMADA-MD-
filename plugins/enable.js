let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let type = (args[0] || '').toLowerCase()
  let isAll = false
  let isUser = false

  switch (type) {
    case 'welcome':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.welcome = isEnable
      break

    case 'detect':
      if (m.isGroup && !isAdmin) return global.dfail('admin', m, conn)
      chat.detect = isEnable
      break

    case 'delete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.delete = isEnable
      break

    case 'antidelete':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.delete = !isEnable
      break

    case 'autobio':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.autoBio = isEnable
      break

    case 'autodelvn':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.autodelvn = isEnable
      break

    case 'document':
      chat.useDocument = isEnable
      break

    case 'antilink':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiLink = isEnable
      break

    case 'antisticker':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiSticker = isEnable
      break

    case 'autosticker':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.stiker = isEnable
      break

    case 'antibadword':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.antiBadword = isEnable
      break

    case 'viewonce':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.viewonce = isEnable
      break

    case 'nsfw':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.nsfw = isEnable
      break

    case 'menu':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.menu = isEnable
      break

    case 'simi':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.simi = isEnable
      break

    case 'autogpt':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.autogpt = isEnable
      break

    case 'rpg':
      if (m.isGroup && !(isAdmin || isOwner)) return global.dfail('admin', m, conn)
      chat.rpgs = isEnable
      break

    case 'autolevelup':
      isUser = true
      user.autolevelup = isEnable
      break

    case 'public':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['self'] = !isEnable
      break

    case 'restrict':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['restrict'] = isEnable
      break

    case 'nyimak':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['nyimak'] = isEnable
      break

    case 'autoread':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['autoread'] = isEnable
      break

    case 'pconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['pconly'] = isEnable
      break

    case 'gconly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['gconly'] = isEnable
      break

    case 'self':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['self'] = isEnable
      break

    case 'swonly':
      isAll = true
      if (!isROwner) return global.dfail('rowner', m, conn)
      global.opts['swonly'] = isEnable
      break

    default:
      return m.reply(`
List option:
| antibadword
| antidelete
| antilink
| antisticker
| autobio
| autogpt
| autolevelup
| autoread
| autosticker
| delete
| detect
| document
| gconly
| menu
| nsfw
| nyimak
| pconly
| public
| rpg
| self
| simi
| swonly
| welcome

Contoh:
${usedPrefix}enable rpg
${usedPrefix}disable rpg
`.trim())
  }

  m.reply(`*${type}* berhasil di *${isEnable ? 'nyala' : 'mati'}kan* ${isAll ? 'untuk bot ini' : isUser ? '' : 'untuk chat ini'}`)
}

handler.help = ['enable <option>', 'disable <option>']
handler.tags = ['group', 'owner']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

export default handler