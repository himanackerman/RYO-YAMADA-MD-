import fs from 'fs'
import moment from 'moment-timezone'

let handler = m => m

handler.all = async function (m) {

    // ===== THUMB LOCAL WAJIB ADA =====
    let thumb = fs.readFileSync('./thumbnail.jpg')

    // ===== AD REPLY =====
    global.adReply = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: false,
            forwardedNewsletterMessageInfo: {
                newsletterName: global.newsletterName,
                newsletterJid: global.chId
            },
            externalAdReply: {
                title: global.namebot,
                body: momentGreeting(),
                previewType: 'PHOTO',
                thumbnail: thumb
            }
        }
    }

    // ===== FAKE STATUS =====
    global.fstatus = {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: global.namebot
        },
        message: {
            locationMessage: {
                name: global.namebot,
                jpegThumbnail: thumb
            }
        }
    }

    // ===== FAKE KONTAK =====
    global.fkontak = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            contactMessage: {
                displayName: global.wm,
                vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;${global.wm},;;;
FN:${global.wm}
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`,
                jpegThumbnail: thumb
            }
        }
    }

    // ===== FAKE VN =====
    global.fvn = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            audioMessage: {
                mimetype: 'audio/ogg; codecs=opus',
                seconds: '999999',
                ptt: true
            }
        }
    }

    // ===== FAKE TEXT =====
    global.ftextt = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            extendedTextMessage: {
                text: global.wm,
                title: global.wm,
                jpegThumbnail: thumb
            }
        }
    }

    // ===== FAKE GIF =====
    global.fgif = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            videoMessage: {
                title: global.wm,
                seconds: '999',
                gifPlayback: true,
                caption: global.wm,
                jpegThumbnail: thumb
            }
        }
    }

    // ===== FAKE TOKO =====
    global.ftoko = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            productMessage: {
                product: {
                    productImage: {
                        mimetype: 'image/jpeg',
                        jpegThumbnail: thumb
                    },
                    title: global.wm,
                    description: 'Simple Bot ESM',
                    currencyCode: 'IDR',
                    priceAmount1000: '7777777',
                    retailerId: global.author,
                    productImageCount: 1
                },
                businessOwnerJid: '0@s.whatsapp.net'
            }
        }
    }

    // ===== FAKE DOC =====
    global.fdocs = {
        key: { participant: '0@s.whatsapp.net' },
        message: {
            documentMessage: {
                title: global.wm,
                jpegThumbnail: thumb
            }
        }
    }

    // ===== FAKE GC LINK =====
    global.fgclink = {
        key: { fromMe: false, participant: '0@s.whatsapp.net' },
        message: {
            groupInviteMessage: {
                groupJid: '628xxx-xxx@g.us',
                inviteCode: 'null',
                groupName: `${global.namebot} Community`,
                caption: global.wm,
                jpegThumbnail: thumb
            }
        }
    }
}

export default handler

function momentGreeting() {
    const hour = moment.tz('Asia/Jakarta').hour()
    if (hour >= 18) return 'Konbanwa 🌙'
    if (hour >= 15) return 'Konnichiwa 🌆'
    if (hour > 10) return 'Konnichiwa ☀️'
    if (hour >= 4) return 'Ohayou Gozaimasu 🌅'
    return 'Oyasuminasai 🌌'
                }
