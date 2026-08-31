import { smsg } from './lib/simple.js'
import { initUser, initChat, initSettings } from './lib/database.js'
import { trackAlbum } from './lib/album.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync } from 'fs'
import sharp from 'sharp'
import chalk from 'chalk'
import fetch from 'node-fetch'

/**
 * @type {import('baileys')}
 */
const { proto } = (await import('baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    const conn = this
    
    if (m.key?.fromMe && conn.sentMessageIds?.has(m.key.id)) return
    
    if (global.db.data == null) await global.loadDatabase()
    
    try {
    m = smsg(this, m) || m
    if (!m) return

    trackAlbum(m) 
    m.exp = 0
    m.limit = false

m.senderPN = m.sender

if (m.sender?.endsWith('@lid')) {
    const resolved = await conn.findUserId(m.sender).catch(() => null)
    if (resolved?.phoneNumber) {
        m.senderPN = resolved.phoneNumber
    }
}

m.mentionedJidPN = []

if (Array.isArray(m.mentionedJid)) {
    m.mentionedJidPN = await Promise.all(
        m.mentionedJid.map(async jid => {
            if (!jid?.endsWith('@lid')) return jid

            const resolved = await conn.findUserId(jid).catch(() => null)
            return resolved?.phoneNumber || jid
        })
    )
}

m.quotedSenderPN = m.quoted?.sender || null

if (m.quoted?.sender?.endsWith('@lid')) {
    const resolved = await conn.findUserId(m.quoted.sender).catch(() => null)

    if (resolved?.phoneNumber) {
        m.quotedSenderPN = resolved.phoneNumber
    }
}

        if (m.pushName && m.sender) {
            if (!global.nameCache) global.nameCache = {}
            global.nameCache[m.sender] = m.pushName
        }

        if (m.messageStubType === 22 && m.chat?.endsWith('@g.us')) {
            let chats = global.db.data.chats?.[m.chat]
            if (chats?.detect) {
                await this.sendMessage(m.chat, { text: chats.sIcon || '```Icon grup diganti```' }).catch(console.error)
            }
        }

        // auto typing 
        if (global.autotyping && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('composing', m.chat).catch(console.error)
        }
        if (global.autorecording && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('recording', m.chat).catch(console.error)
        }

        try {

            let user = initUser(m.sender, m.name)

            let chat = initChat(m.chat)

            let settings = initSettings(this.user.jid)

        } catch (e) {
            console.error('INIT ERROR:', e)
        }

        // Options Check
        if (opts['nyimak']) return
        if (opts['pconly'] && m.chat.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        let resolvedSender = m.sender
if (m.sender.endsWith('@lid')) {
  const resolved = await conn.findUserId(m.sender).catch(() => null)
  if (resolved?.phoneNumber) resolvedSender = resolved.phoneNumber
}
const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(resolvedSender)
const isMainBot = conn === global.conn
const isOwner = isROwner || (isMainBot && m.fromMe)
const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(resolvedSender)
const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0
        
        if (!isOwner && !m.fromMe && opts['self']) return

        if (m.isGroup && !isOwner && global.db.data.chats[m.chat]?.mutegc) return
        
        // Message Queue
        if (m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            let intervalID = setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(intervalID)
                await delay(time)
            }, time)
        }

if (m.isBaileys) return

if (global.db.data.chats[m.chat]?.autolevelup) {
    m.exp += Math.ceil(Math.random() * 10)
}

        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => ({})) : {}
        const participants = m.isGroup ?(groupMetadata.participants || []) : []
        
let userIds = await conn.findUserId(m.sender).catch(() => ({}))
let botIds = await conn.findUserId(conn.user.id).catch(() => ({}))

const idsUser = [
  userIds?.phoneNumber,
  userIds?.lid
].filter(v => v && v !== 'id-not-found')

const idsBot = [
  botIds?.phoneNumber,
  botIds?.lid
].filter(v => v && v !== 'id-not-found')

const groupUser = m.isGroup
  ? participants.find(u => idsUser.includes(u.id))
  : {}

const bot = m.isGroup
  ? participants.find(u => idsBot.includes(u.id))
  : {}

const isRAdmin = groupUser?.admin === 'superadmin'
const isAdmin = isRAdmin || groupUser?.admin === 'admin'
const isBotAdmin = ['admin', 'superadmin'].includes(bot?.admin)

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        let user = global.db.data.users[m.sender]
/*
if (user && user.name && !user.registered) {
    user.registered = true
}
*/

for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    let chat = global.db.data.chats[m.chat]

    if (chat?.isBanned) {
        if (!name.endsWith('owner/unbanchat.js')) continue
    }
            
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }

            if (opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) continue

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[[], new RegExp]]
            ).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, user, bot,
                    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue
            
                    let usedPrefix
        if ((usedPrefix = (match[0] || '')[0])) {
            let noPrefix = m.text.replace(usedPrefix, '')
            let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
        
            args = args || []
            let _args = noPrefix.trim().split` `.slice(1)
            let text = _args.join` `
        
            if (m.mentionedJid?.length && /^@/.test(text)) {
                try {
                    text = await conn.getName(m.mentionedJid[0])
                } catch {}
            }
        
            command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue
                
                m.plugin = name
                let chat = global.db.data.chats[m.chat]
                
                if (plugin.rpg && m.isGroup && !chat?.rpgs) {
                    m.reply('🎮 Mode RPG di grup ini belum aktif\n\nKetik:\n.enable rpg')
                    continue
                }

                if (chat?.isBanned && !isOwner) return 
                if (user?.banned && !isOwner) return

                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && !user.registered) { fail('unreg', m, this); continue }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp < 200 && user?.autolevelup) m.exp += xp

                if (!isPrems && plugin.limit && user.limit < plugin.limit * 1) {
                    this.reply(m.chat, `[❗] Limit harian kamu telah habis`, m)
                    continue 
                }
                
                if (plugin.level > user.level) {
                    this.reply(m.chat, `[💬] Diperlukan level ${plugin.level} untuk perintah ini\n*Level mu:* ${user.level} 📊`, m)
                    continue 
                }

                let extra = {
    match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
    participants, groupMetadata, user, bot,
    isROwner, isOwner, isRAdmin, isAdmin,
    isBotAdmin, isPrems,
    senderPN: m.senderPN,
    chatUpdate, __dirname: ___dirname, __filename
                }

                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        m.reply(`*Error:* ${text}`)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.limit) m.reply(+m.limit + ' Limit terpakai')
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
            if (m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }
        
        let user = global.db.data.users[m.sender]
        
        if (user && global.db.data.chats[m.chat]?.autolevelup) {
            user.exp += (m.exp || 0)
        }
        
        if (user && m.limit) user.limit -= (m.limit * 1)
        
        await global.db.write?.()

    try {
        if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
    } catch (e) {
        console.log(e)
    }
    if (opts['autoread']) await conn.readMessages([m.key])
}
}

export async function participantsUpdate({ id, participants, action }) {
    if (opts['self'] || this.isInit) return
    if (global.db.data == null) await global.loadDatabase()

    let chat = global.db.data.chats[id]
    if (!chat || !chat.welcome) return

    let groupMetadata = await this.groupMetadata(id).catch(() => null)
    if (!groupMetadata || !groupMetadata.subject) {
        groupMetadata = this.chats?.[id] || {}
    }

    let groupName = groupMetadata.subject || groupMetadata.name || id.split('@')[0]
    let memberCount = groupMetadata.participants?.length || 0

    for (let userObj of participants) {
        let user = typeof userObj === 'object'
            ? (userObj.phoneNumber || userObj.id || userObj.lid || '')
            : userObj

        let ids = await this.findUserId(user).catch(() => null)

        let displayName =
            global.nameCache?.[ids?.lid] ||
            global.nameCache?.[user] ||
            global.nameCache?.[ids?.phoneNumber] ||
            this.getName(user) ||
            user.split('@')[0]

        let pp = 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg'
        try {
            pp = await this.profilePictureUrl(user, 'image')
        } catch {}

        let text = ''

        // ================= WELCOME =================
        if (action === 'add') {
            text = chat.sWelcome?.trim()
                ? chat.sWelcome
                : `👋 Halo ${displayName}!\n\nSelamat datang di *${groupName}* ✨`
        }

        // ================= GOODBYE =================
        if (action === 'remove') {
            text = chat.sBye?.trim()
                ? chat.sBye
                : `✨ Sayonara ${displayName}`
        }

        // ================= PROMOTE =================
        if (action === 'promote') {
            text = (chat.sPromote || this.spromote || '@user Sekarang jadi admin!')
                .replace('@user', displayName)

            await this.sendMessage(id, { text })
            continue
        }

        // ================= DEMOTE =================
        if (action === 'demote') {
            text = (chat.sDemote || this.sdemote || '@user Sekarang bukan lagi admin!')
                .replace('@user', displayName)

            await this.sendMessage(id, { text })
            continue
        }

        text = text
            .replace('@user', displayName)
            .replace('@subject', groupName)
            .replace('@desc', groupMetadata.desc || '')

        try {
            const {
                createWelcomeCanvas,
                createGoodbyeCanvas
            } = await import('./lib/welcomeCanvas.js')

            let buf

            if (action === 'add') {
                buf = await createWelcomeCanvas({
                    groupName,
                    avatarUrl: pp,
                    name: displayName,
                    count: memberCount + 1
                })
            } else if (action === 'remove') {
                buf = await createGoodbyeCanvas({
                    groupName,
                    avatarUrl: pp,
                    name: displayName,
                    count: memberCount
                })
            }

            await this.sendMessage(id, {
                image: buf,
                caption: text
            })
        } catch (e) {
            console.log('WELCOME ERROR:', e)
            await this.sendMessage(id, { text })
        }
    }
}
export async function groupsUpdate(groupsUpdate) {
    if (opts['self']) return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (!chats?.detect) continue
        if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || 'Deskripsi telah diubah menjadi \n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || 'Judul grup telah diubah menjadi \n@subject').replace('@subject', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || 'Icon grup telah diubah!')
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || 'Link group telah diubah ke \n@revoke').replace('@revoke', groupUpdate.revoke)
        if (groupUpdate.announce == true) text = this.sAnnounceOn || 'Group telah di tutup!\nsekarang hanya admin yang dapat mengirim pesan.'
        if (groupUpdate.announce == false) text = this.sAnnounceOff || 'Group telah di buka!\nsekarang semua peserta dapat mengirim pesan.'
        if (groupUpdate.restrict == true) text = this.sRestrictOn || 'Edit Info Grup di ubah ke hanya admin!'
        if (groupUpdate.restrict == false) text = this.sRestrictOff || 'Edit Info Grup di ubah ke semua peserta!'

        if (!text) continue
        this.reply(id, text.trim())
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe) return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg || !global.db.data.chats[msg.chat]?.delete) return

        const who = (participant || msg.sender).split('@')[0]
        await this.reply(msg.chat, `Terdeteksi @${who} telah menghapus pesan.`, msg, { mentions: [participant || msg.sender] })
        await this.copyNForward(msg.chat, msg).catch(() => {})
    } catch (e) {
        console.error(e)
    }
}

global.dfail = async (type, m, conn) => {
  const msg = {
    rowner: '*`ᴅᴇᴠᴇʟᴏᴘᴇʀ ᴏɴʟʏ • ᴀᴋsᴇs ɪɴɪ ʜᴀɴʏᴀ ᴛᴇʀsᴇᴅɪᴀ ᴜɴᴛᴜᴋ ᴅᴇᴠᴇʟᴏᴘᴇʀ ʙᴏᴛ.`*',
    owner: '*`ᴏᴡɴᴇʀ ᴏɴʟʏ • ᴀᴋsᴇs ɪɴɪ ʜᴀɴʏᴀ ᴛᴇʀsᴇᴅɪᴀ ᴜɴᴛᴜᴋ ᴏᴡɴᴇʀ ʙᴏᴛ.`*',
    mods: '*`ᴍᴏᴅᴇʀᴀᴛᴏʀ ᴏɴʟʏ • ᴀᴋsᴇs ɪɴɪ ʜᴀɴʏᴀ ᴛᴇʀsᴇᴅɪᴀ ᴜɴᴛᴜᴋ ᴍᴏᴅᴇʀᴀᴛᴏʀ ʙᴏᴛ.`*',
    premium: '*`ᴘʀᴇᴍɪᴜᴍ ᴏɴʟʏ • ғɪᴛᴜʀ ɪɴɪ ᴋʜᴜsᴜs ᴜɴᴛᴜᴋ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ.`*',
    group: '*`ɢʀᴏᴜᴘ ᴏɴʟʏ • ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴅᴀʟᴀᴍ ɢʀᴜᴘ.`*',
    private: '*`ᴘʀɪᴠᴀᴛᴇ ᴏɴʟʏ • ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴄʜᴀᴛ ᴘʀɪʙᴀᴅɪ.`*',
    admin: '*`ᴀᴅᴍɪɴ ᴏɴʟʏ • ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ ᴏʟᴇʜ ᴀᴅᴍɪɴ ɢʀᴜᴘ.`*',
    botAdmin: '*`ʙᴏᴛ ᴀᴅᴍɪɴ ʀᴇǫᴜɪʀᴇᴅ • ᴊᴀᴅɪᴋᴀɴ ʙᴏᴛ sᴇʙᴀɢᴀɪ ᴀᴅᴍɪɴ ᴛᴇʀʟᴇʙɪʜ ᴅᴀʜᴜʟᴜ.`*',
    unreg: '*`ʀᴇɢɪsᴛʀᴀᴛɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ • sɪʟᴀᴋᴀɴ ᴅᴀғᴛᴀʀ ᴅᴇɴɢᴀɴ ᴘᴇʀɪɴᴛᴀʜ .ᴅᴀғᴛᴀʀ.`*',
    restrict: '*`ʀᴇsᴛʀɪᴄᴛ ᴅɪsᴀʙʟᴇᴅ • ᴍᴏᴅᴇ ʀᴇsᴛʀɪᴄᴛ ʙᴇʟᴜᴍ ᴅɪᴀᴋᴛɪғᴋᴀɴ ᴅɪ ᴄʜᴀᴛ ɪɴɪ.`*'
  }

  if (!msg[type]) return

  try {
    const thumb = readFileSync('./thumbnail.jpg')
    const resizedThumb = await sharp(thumb)
      .resize(300, 300, { fit: 'cover' })
      .png()
      .toBuffer()

    await conn.sendMessage(m.chat, {
      document: thumb,
      mimetype: 'image/png',
      fileLength: global.fsizedoc || 999999,
      fileName: global.namebot,
      caption: msg[type],
      jpegThumbnail: resizedThumb,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.chId,
          newsletterName: global.namebot,
          serverMessageId: 1
        }
      }
    }, { quoted: m })
  } catch (e) {
    console.error('dfail media error:', e)
    m.reply(msg[type])
  }
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})