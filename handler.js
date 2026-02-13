import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

/**
 * @type {import('@adiwajshing/baileys')}
 */
const { proto } = (await import('@adiwajshing/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    
    const conn = this
    
    if (global.db.data == null) await global.loadDatabase()
    
    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.limit = false

        // auto typing 
        if (global.autotyping && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('composing', m.chat).catch(console.error)
        }
        if (global.autorecording && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('recording', m.chat).catch(console.error)
        }

        try {
            // USER DATABASE INIT
            if (typeof global.db.data.users[m.sender] !== 'object')
                global.db.data.users[m.sender] = {}
            
            let user = global.db.data.users[m.sender]
            const defaults = {
                registered: false, name: m.name || '', age: -1, regTime: -1, level: 0, warn: 0, exp: 0, limit: 100, afk: -1, afkReason: '', banned: false, banReason: '', role: 'Free user', autolevelup: false, chip: 0, money: 0, atm: 0, fullatm: 0, bank: 0, health: 100, energy: 100, sleep: 100, potion: 0, trash: 0, wood: 0, rock: 0, string: 0, petfood: 0, emerald: 0, diamond: 0, gold: 0, botol: 0, kardus: 0, kaleng: 0, gelas: 0, plastik: 0, iron: 0, common: 0, uncommon: 0, mythic: 0, legendary: 0, umpan: 0, pet: 0, paus: 0, kepiting: 0, gurita: 0, cumi: 0, buntal: 0, dory: 0, lumba: 0, lobster: 0, hiu: 0, udang: 0, orca: 0, banteng: 0, gajah: 0, harimau: 0, kambing: 0, panda: 0, buaya: 0, kerbau: 0, sapi: 0, monyet: 0, babihutan: 0, babi: 0, ayam: 0, steak: 0, ayam_goreng: 0, ribs: 0, roti: 0, udang_goreng: 0, bacon: 0, gandum: 0, minyak: 0, garam: 0, ojek: 0, polisi: 0, roket: 0, taxy: 0, lockBankCD: 0, lasthackbank: 0, lastadventure: 0, lastkill: 0, lastmisi: 0, lastdungeon: 0, lastwar: 0, lastsda: 0, lastduel: 0, lastmining: 0, lasthunt: 0, lastgift: 0, lastberkebon: 0, lastdagang: 0, lasthourly: 0, lastbansos: 0, lastrampok: 0, lastclaim: 0, lastnebang: 0, lastweekly: 0, lastmonthly: 0, apel: 0, anggur: 0, jeruk: 0, mangga: 0, pisang: 0, makanan: 0, bibitanggur: 0, bibitpisang: 0, bibitapel: 0, bibitmangga: 0, bibitjeruk: 0, horse: 0, horseexp: 0, cat: 0, catexp: 0, fox: 0, foxexp: 0, dogexp: 0, robo: 0, roboexp: 0, dragon: 0, dragonexp: 0, lion: 0, lionexp: 0, rhinoceros: 0, rhinocerosexp: 0, centaur: 0, centaurexp: 0, kyubi: 0, kyubiexp: 0, griffin: 0, griffinexp: 0, phonix: 0, phonixexp: 0, wolf: 0, wolfexp: 0, horselastfeed: 0, catlastfeed: 0, robolastfeed: 0, foxlastfeed: 0, doglastfeed: 0, dragonlastfeed: 0, lionlastfeed: 0, rhinoceroslastfeed: 0, centaurlastfeed: 0, kyubilastfeed: 0, griffinlastfeed: 0, phonixlastfeed: 0, wolflastfeed: 0, armor: 0, armordurability: 0, sword: 0, sworddurability: 0, pickaxe: 0, pickaxedurability: 0, fishingrod: 0, fishingroddurability: 0, robodurability: 0
            }
            for (let key in defaults) if (!(key in user)) user[key] = defaults[key]

            // CHAT DATABASE INIT
            if (typeof global.db.data.chats[m.chat] !== 'object')
                global.db.data.chats[m.chat] = {}
            
            let chat = global.db.data.chats[m.chat]
            const chatDefaults = {
                isBanned: false, welcome: false, detect: false, sWelcome: '', sBye: '', sPromote: '', sDemote: '',
                delete: false, 
                antiLink: false, viewonce: false, antiToxic: false, simi: false, autogpt: false, autoSticker: false, premium: false, premiumTime: false, nsfw: false, menu: true, rpgs: false, expired: 0
            }
            for (let key in chatDefaults) if (!(key in chat)) chat[key] = chatDefaults[key]

            // SETTINGS INIT
            if (typeof global.db.data.settings[this.user.jid] !== 'object')
                global.db.data.settings[this.user.jid] = {}
            
            let settings = global.db.data.settings[this.user.jid]
            const settingDefaults = { self: false, autoread: false, anticall: true, restartDB: 0, restrict: false }
            for (let key in settingDefaults) if (!(key in settings)) settings[key] = settingDefaults[key]
            
        } catch (e) {
            console.error('INIT ERROR:', e)
        }

        // Options Check
        if (opts['nyimak']) return
        if (opts['pconly'] && m.chat.endsWith('g.us')) return
        if (opts['gconly'] && !m.chat.endsWith('g.us')) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (typeof m.text !== 'string') m.text = ''

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0
        
        if (!isOwner && !m.fromMe && opts['self']) return
        
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
        if (global.db.data.users[m.sender]?.autolevelup) {
            m.exp += Math.ceil(Math.random() * 10)
        }

        // Group Metadata
        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(e => ({})) : {}
        const participants = m.isGroup ? groupMetadata.participants : []
        const useLid = groupMetadata.addressingMode === 'lid'
        let groupUser = {}, bot = {}

        if (m.isGroup) {
            if (useLid) {
                const senderLid = participants.find(p => p.jid === conn.decodeJid(m.sender))?.lid
                const botLid = participants.find(p => p.jid === conn.decodeJid(conn.user.id))?.lid
                groupUser = participants.find(p => p.lid === senderLid) || {}
                bot = participants.find(p => p.lid === botLid) || {}
            } else {
                groupUser = participants.find(u => conn.decodeJid(u.id || u.jid) === conn.decodeJid(m.sender)) || {}
                bot = participants.find(u => conn.decodeJid(u.id || u.jid) === conn.decodeJid(conn.user.id)) || {}
            }
        }

        const isRAdmin = groupUser?.admin === 'superadmin'
        const isAdmin = isRAdmin || groupUser?.admin === 'admin'
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        let user = global.db.data.users[m.sender]
        
        for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin || plugin.disabled) continue

    let chat = global.db.data.chats[m.chat]

    if (chat?.isBanned) {
        if (!['owner-unbanchat.js'].includes(name)) continue
    }
            
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }

            if (!opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) continue

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
                    participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
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
        if (user && user.autolevelup) user.exp += (m.exp || 0)
        if (user && m.limit) user.limit -= (m.limit * 1)

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

    const groupMetadata = (this.chats[id] || {}).metadata || (await this.groupMetadata(id).catch(() => ({})))
    let groupName = groupMetadata.subject || 'Group'
    let memberCount = groupMetadata.participants?.length || 0

    for (let user of participants) {
        user = user.id || user
        let pp = 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg'
        try { pp = await this.profilePictureUrl(user, 'image') } catch {}

        let username = this.getName(user) || user.split('@')[0]

        if (action === 'add') {
            let api = `https://api.siputzx.my.id/api/canvas/welcomev5?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount + 1}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(global.welcomeBg)}&quality=90`
            let res = await fetch(api)
            if (res.ok) {
                let buffer = Buffer.from(await res.arrayBuffer())
                await this.sendMessage(id, { image: buffer, caption: `Selamat datang @${user.split('@')[0]}`, mentions: [user] })
            }
        }

        if (action === 'remove') {
            let api = `https://api.siputzx.my.id/api/canvas/goodbyev5?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp)}&background=${encodeURIComponent(global.goodbyeBg)}&quality=90`
            let res = await fetch(api)
            if (res.ok) {
                let buffer = Buffer.from(await res.arrayBuffer())
                await this.sendMessage(id, { image: buffer, caption: `Sampai jumpa @${user.split('@')[0]}`, mentions: [user] })
            }
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
        if (groupUpdate.desc) text = (chats.sDesc || '```Deskripsi diganti ke```\n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || '```Judul diganti ke```\n@subject').replace('@subject', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || '```Icon grup diganti```')
        if (groupUpdate.announce == true) text = '*Grup ditutup!*'
        if (groupUpdate.announce == false) text = '*Grup dibuka!*'
        
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

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: 'Khusus developer bot 🎧',
        owner: 'Hanya untuk owner bot 🎸',
        mods: 'Bagian moderator 🎯',
        premium: 'Fitur ini untuk pengguna premium ✨',
        group: 'Gunakan di dalam grup 👥',
        private: 'Gunakan di chat pribadi 💬',
        admin: 'Khusus admin grup 🛡️',
        botAdmin: 'Bot perlu jadi admin dulu ⚙️',
        unreg: 'Belum terdaftar. Ketik *.daftar* 📝',
        restrict: 'Restrict belum diaktifkan ⚙️',
        disable: 'Perintah ini sedang dimatikan 🚫',
    }[type]
    if (msg) return conn.reply(m.chat, msg, m)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})