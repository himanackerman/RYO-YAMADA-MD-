/**
 * Ini sc free jangan di jual ya
 * Base Nao ESM 
 * Info script di CH https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 **/

import moment from 'moment-timezone'
moment.locale('id')

const THUMB = global.menuThumb
const MENU_SOUND = global.menuAudio

const mapFrom = 'abcdefghijklmnopqrstuvwxyz1234567890'
const mapTo = [
  'ᴀ','ʙ','ᴄ','ᴅ','ᴇ','ꜰ','ɢ','ʜ','ɪ','ᴊ','ᴋ','ʟ','ᴍ',
  'ɴ','ᴏ','ᴘ','q','ʀ','ꜱ','ᴛ','ᴜ','ᴠ','ᴡ','x','ʏ','ᴢ',
  '1','2','3','4','5','6','7','8','9','0'
]

function toSmallCaps(text = '') {
  return text.toLowerCase().split('').map(c => {
    const i = mapFrom.indexOf(c)
    return i !== -1 ? mapTo[i] : c
  }).join('')
}

function formatTag(tag) {
  return tag.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function randomSquare() {
  return Array.isArray(global.hsquere)
    ? global.hsquere[Math.floor(Math.random() * global.hsquere.length)]
    : ''
}

const adReply = (title, body) => ({
  contextInfo: {
    externalAdReply: {
      title,
      body,
      thumbnailUrl: THUMB,
      mediaType: 1,
      renderLargerThumbnail: true,
      showAdAttribution: false,
      sourceUrl: 'https://github.com/himanackerman'
    }
  }
})

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const who = m.sender
    const user = global.db.data.users[who]

    const isOwner = Array.isArray(global.owner)
      ? global.owner.some(v => (Array.isArray(v) ? v[0] : v) === who.split('@')[0])
      : false

    const botname = global.namebot 