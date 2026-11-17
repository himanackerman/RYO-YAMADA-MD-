import moment from "moment-timezone"

export async function before(m) {
  const chat = global.db.data?.chats?.[m.chat]
  if (!chat || !chat.autosolat) return false

  this.autosholat = this.autosholat || {}

  const who = m.mentionedJid?.[0] || (m.fromMe ? this.user.jid : m.sender)
  const id = m.chat
  const now = Date.now()

  if (id in this.autosholat && now - this.autosholat[id].timestamp < 300000) return false

  const jadwalSholat = {
    Fajr: "04:42",
    Sunrise: "05:58",
    Dhuhr: "12:03",
    Asr: "15:09",
    Sunset: "18:08",
    Maghrib: "18:08",
    Isha: "19:38",
    Imsak: "04:32",
    Midnight: "00:03",
    Firstthird: "22:04",
    Lastthird: "02:01",
  }

  const timeNow = moment().tz("Asia/Jakarta").format("HH:mm")

  if (Object.values(jadwalSholat).includes(timeNow)) {
    const sholat = Object.keys(jadwalSholat).find(key => jadwalSholat[key] === timeNow)

    const caption = `*\`PENGINGAT SHOLAT\`*

✿ Waktu   : *${sholat}* (${timeNow} WIB)
✿ Wilayah : Jakarta dan sekitarnya

Waktu sholat *${sholat}* telah tiba, ambillah air wudhu dan segeralah menunaikan shalat.`

    this.autosholat[id] = {
      msg: await this.reply(
        m.chat,
        caption,
        null,
        {
          contextInfo: {
            mentionedJid: [who]
          }
        }
      ),
      timestamp: now
    }

    setTimeout(() => delete this.autosholat[id], 57000)
  }
}

export const disabled = false