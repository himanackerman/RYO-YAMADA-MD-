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
        thumb = await (await fetch(fallbackThumb)).buffer()
    }

    global.adReply = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: false,
            forwardedNewsletterMessageInfo: {
                newsletterName: `「 RYO YAMADA - MD 」`,
                newsletterJid: "120363395114168746@newsletter"
            },
            externalAdReply: {
                title: `ʀyᴏ yᴀᴍᴀᴅᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ`,
                body: `${momentGreeting()}`,
                previewType: "PHOTO",
                thumbnail: thumb
            }
        }
    }

    // === Fake STATUS ===
    global.fstatus = {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast',
            fromMe: false,
            id: 'RyoYamada'
        },
        message: {
            locationMessage: {
                name: 'Ryo Yamada MD',
                jpegThumbnail: thumb
            }
        }
    }

    // === fkontak ===
    global.fkontak = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            contactMessage: {
                displayName: global.wm,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${wm},;;;\nFN:${wm}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                jpegThumbnail: thumb,
            }
        }
    }

    // === Fake VN ===
    global.fvn = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            audioMessage: {
                mimetype: "audio/ogg; codecs=opus",
                seconds: "999999",
                ptt: true
            }
        }
    }

    // === Fake Text ===
    global.ftextt = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            extendedTextMessage: {
                text: wm,
                title: wm,
                jpegThumbnail: thumb
            }
        }
    }

    // === Fake Gif ===
    global.fgif = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            videoMessage: {
                title: wm,
                h: "Hmm",
                seconds: "999",
                gifPlayback: true,
                caption: wm,
                jpegThumbnail: thumb
            }
        }
    }

    // === Fake Toko ===
    global.ftoko = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            productMessage: {
                product: {
                    productImage: {
                        mimetype: "image/jpeg",
                        jpegThumbnail: thumb
                    },
                    title: wm,
                    description: "Simple Bot Esm",
                    currencyCode: "IDR",
                    priceAmount1000: "20000000",
                    retailerId: "Ryo Yamada",
                    productImageCount: 1
                },
                businessOwnerJid: `0@s.whatsapp.net`
            }
        }
    }

    // === Fake Document ===
    global.fdocs = {
        key: { participant: '0@s.whatsapp.net' },
        message: {
            documentMessage: {
                title: wm,
                jpegThumbnail: thumb
            }
        }
    }

    // === Fake Group Invite ===
    global.fgclink = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
        },
        message: {
            groupInviteMessage: {
                groupJid: "628xxx-xxx@g.us",
                inviteCode: "null",
                groupName: "Ryo Yamada Community",
                caption: wm,
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
/*
import fs from 'fs'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

const fallbackThumb = 'https://eiiuzfmbewjlwfjz.public.blob.vercel-storage.com/YnU5WMiCgO_file.jpeg'

let handler = m => m

handler.all = async function (m) {
    global.wm = 'ʀyᴏ yᴀᴍᴀᴅᴀ ᴍᴜʟᴛɪ ᴅᴇᴠɪᴄᴇ'

    let thumb
    try {
        thumb = fs.readFileSync('./thumbnail.jpg')
    } catch {
        thumb = await (await fetch(fallbackThumb)).buffer()
    }

    let chId = global.chId
    let nName = global.newsletterName

    if (!chId) throw 'global.chId belum diset'
    if (!nName) throw 'global.newsletterName belum diset'

    global.adReply = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: nName,
                newsletterJid: chId
            }
        }
    }

    global.fkontak = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net'
        },
        message: {
            contactMessage: {
                displayName: global.wm,
                vcard: `BEGIN:VCARD
VERSION:3.0
N:XL;${wm},;;;
FN:${wm}
item1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
item1.X-ABLabel:Ponsel
END:VCARD`,
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
                mimetype: 'audio/ogg; codecs=opus',
                seconds: '999999',
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
                text: wm,
                title: wm,
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
                title: wm,
                h: 'Hmm',
                seconds: '999',
                gifPlayback: true,
                caption: wm,
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
                        mimetype: 'image/jpeg',
                        jpegThumbnail: thumb
                    },
                    title: wm,
                    description: 'Simple Bot Esm',
                    currencyCode: 'IDR',
                    priceAmount1000: '20000000',
                    retailerId: 'Ryo Yamada',
                    productImageCount: 1
                },
                businessOwnerJid: '0@s.whatsapp.net'
            }
        }
    }

    global.fdocs = {
        key: {
            participant: '0@s.whatsapp.net'
        },
        message: {
            documentMessage: {
                title: wm,
                jpegThumbnail: thumb
            }
        }
    }

    global.fgclink = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net'
        },
        message: {
            groupInviteMessage: {
                groupJid: '628xxx-xxx@g.us',
                inviteCode: 'null',
                groupName: 'Ryo Yamada Community',
                caption: wm,
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
*/