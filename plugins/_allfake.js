import fs from 'fs'
import moment from 'moment-timezone'

const fallbackThumb = "https://eiiuzfmbewjlwfjz.public.blob.vercel-storage.com/YnU5WMiCgO_file.jpeg"

let handler = m => m

handler.all = async function (m) {
  global.wm = 'ʀyᴏ yᴀᴍᴀᴅᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ'

  let thumb
  try {
    thumb = fs.readFileSync('./thumbnail.jpg')
  } catch {
    let res = await fetch(fallbackThumb)
    let arr = await res.arrayBuffer()
    thumb = Buffer.from(arr)
  }

  global.fkontak = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      contactMessage: {
        displayName: global.wm,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${global.wm}\nTEL;waid=0:0\nEND:VCARD`,
        jpegThumbnail: thumb
      }
    }
  }

  global.fvn = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      audioMessage: {
        mimetype: "audio/ogg; codecs=opus",
        seconds: "999999",
        ptt: true
      }
    }
  }

  global.ftextt = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      extendedTextMessage: {
        text: global.wm,
        title: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.fgif = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      videoMessage: {
        seconds: "999",
        gifPlayback: true,
        caption: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.ftoko = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net'
    },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: "image/jpeg",
            jpegThumbnail: thumb
          },
          title: global.wm,
          description: "Simple Bot Esm",
          currencyCode: "IDR",
          priceAmount1000: "20000000",
          retailerId: "Ryo Yamada",
          productImageCount: 1
        },
        businessOwnerJid: '0@s.whatsapp.net'
      }
    }
  }

  global.fdocs = {
    key: { participant: '0@s.whatsapp.net' },
    message: {
      documentMessage: {
        title: global.wm,
        jpegThumbnail: thumb
      }
    }
  }

  global.fgclink = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net"
    },
    message: {
      groupInviteMessage: {
        groupJid: "628xxx-xxx@g.us",
        inviteCode: "null",
        groupName: "Ryo Yamada Community",
        caption: global.wm,
        jpegThumbnail: thumb
      }
    }
  }
}

export default handler

function momentGreeting() {
  const hour = moment.tz('Asia/Jakarta').hour()
  if (hour >= 18) return 'Konbanwa🍃'
  if (hour >= 15) return 'Konnichiwa🌾'
  if (hour > 10) return 'Konnichiwa🍂'
  if (hour >= 4) return 'Ohayou Gozaimasu🌿'
  return 'Oyasuminasai🪷'
                }
