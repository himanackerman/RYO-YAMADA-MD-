import { readdirSync, existsSync, rmSync } from 'fs'
import { join } from 'path'
import pino from 'pino'
import {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers
} from 'baileys'
import { makeWASocket } from './simple.js'

const SESSIONS_DIR = './sessions/jadibot'

global.jadibotConns = global.jadibotConns || new Map()

function trackSentMessages(conn) {
  conn.sentMessageIds = new Set()

  const _sendMessage = conn.sendMessage.bind(conn)

  conn.sendMessage = async (...args) => {
    const result = await _sendMessage(...args)

    if (result?.key?.id) {
      conn.sentMessageIds.add(result.key.id)

      setTimeout(() => {
        conn.sentMessageIds?.delete(result.key.id)
      }, 15000)
    }

    return result
  }

  return conn
}

async function buildSubConn(sessionPath) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const handlerModule = await import('../handler.js')

  const subConn = trackSentMessages(makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({
          level: 'silent',
          stream: 'store'
        })
      )
    },
    generateHighQualityLinkPreview: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 10000,
    shouldIgnoreJid: () => false
  }))

  subConn.ev.on('creds.update', saveCreds)

  subConn.handler = handlerModule.handler.bind(subConn)
  subConn.participantsUpdate = handlerModule.participantsUpdate.bind(subConn)
  subConn.groupsUpdate = handlerModule.groupsUpdate.bind(subConn)
  subConn.onDelete = handlerModule.deleteUpdate.bind(subConn)

  subConn.ev.on('messages.upsert', subConn.handler)
  subConn.ev.on('group-participants.update', subConn.participantsUpdate)
  subConn.ev.on('groups.update', subConn.groupsUpdate)
  subConn.ev.on('message.delete', subConn.onDelete)

  return subConn
}

async function connectSubBot({
  number,
  sessionPath,
  mainConn,
  notifyChat,
  needsPairing
}) {
  const subConn = await buildSubConn(sessionPath)

  global.jadibotConns.set(number, subConn)

  let pairingRequested = false

  subConn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (
      needsPairing &&
      !subConn.authState.creds.registered &&
      !pairingRequested
    ) {
      pairingRequested = true

      setTimeout(async () => {
        try {
          let code = await subConn.requestPairingCode(number)

          code = code?.match(/.{1,4}/g)?.join('-') || code

          if (notifyChat) {
            await mainConn.sendMessage(notifyChat, {
              text: `🔑 Kode pairing kamu:\n\n*${code}*\n\nBuka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon, terus masukin kode ini.`
            }).catch(() => {})
          }
        } catch (e) {
          console.error('Gagal request pairing code jadibot:', number, e)

          global.jadibotConns.delete(number)

          try {
            rmSync(sessionPath, {
              recursive: true,
              force: true
            })
          } catch {}

          if (notifyChat) {
            await mainConn.sendMessage(notifyChat, {
              text: '❌ Gagal bikin kode pairing, coba lagi.'
            }).catch(() => {})
          }
        }
      }, 2000)
    }

    if (connection === 'open') {
      global.jadibotConns.set(number, subConn)

      if (notifyChat) {
        await mainConn.sendMessage(notifyChat, {
          text: `✅ Berhasil! Nomor *${number}* sekarang jadi sub-bot 🎉`
        }).catch(() => {})
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode

      global.jadibotConns.delete(number)

      if (statusCode === DisconnectReason.loggedOut) {
        try {
          rmSync(sessionPath, {
            recursive: true,
            force: true
          })
        } catch {}

        if (notifyChat) {
          await mainConn.sendMessage(notifyChat, {
            text: `🔌 Sub-bot *${number}* logout, sesi udah dihapus.`
          }).catch(() => {})
        }
      } else {
        connectSubBot({
          number,
          sessionPath,
          mainConn,
          notifyChat,
          needsPairing: false
        }).catch(console.error)
      }
    }
  })

  return subConn
}

export async function startSubBot(m, mainConn, rawNumber) {
  let number = (rawNumber || '').replace(/[^0-9]/g, '')

  if (number.startsWith('0')) {
    number = '62' + number.slice(1)
  }

  if (!number || number.length < 7 || number.length > 15) {
    return m.reply(
      'Format nomor salah. Contoh: *.jadibot 628xxx*'
    )
  }

  if (global.jadibotConns.has(number)) {
    return m.reply('Nomor ini udah konek jadi sub-bot 🙂')
  }

  await m.reply(' Bikin sesi jadibot, tunggu kode pairing muncul ya...')

  const sessionPath = join(SESSIONS_DIR, number)

  await connectSubBot({
    number,
    sessionPath,
    mainConn,
    notifyChat: m.chat,
    needsPairing: true
  })
}

export async function stopSubBot(rawNumber) {
  let number = (rawNumber || '').replace(/[^0-9]/g, '')

  if (number.startsWith('0')) {
    number = '62' + number.slice(1)
  }

  const subConn = global.jadibotConns.get(number)

  if (!subConn) return false

  try {
    subConn.ev.removeAllListeners()
    subConn.ws?.close()
  } catch {}

  global.jadibotConns.delete(number)

  try {
    rmSync(join(SESSIONS_DIR, number), {
      recursive: true,
      force: true
    })
  } catch {}

  return true
}

export async function restoreSubBots(mainConn) {
  if (!existsSync(SESSIONS_DIR)) return

  const folders = readdirSync(SESSIONS_DIR, {
    withFileTypes: true
  }).filter(d => d.isDirectory())

  for (const folder of folders) {
    const number = folder.name
    const sessionPath = join(SESSIONS_DIR, number)
    const credsFile = join(sessionPath, 'creds.json')

    if (!existsSync(credsFile)) continue

    connectSubBot({
      number,
      sessionPath,
      mainConn,
      notifyChat: null,
      needsPairing: false
    }).catch(e => console.error('Gagal restore jadibot:', number, e))
  }
}