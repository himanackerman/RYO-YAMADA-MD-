import { proto } from "@adiwajshing/baileys";

let handler = async (m, { conn, text, command, usedPrefix, isAdmin, isOwner }) => {
  global.db.data.msgs = global.db.data.msgs || {}
  let msgs = global.db.data.msgs

  let cmd = command.toLowerCase()

  // ================= ADD STORE =================
  if (cmd === 'addstore') {
    if (!isOwner) return m.reply("❌ Khusus Owner.")

    if (!text) {
      return m.reply(
        `Gunakan:\n*${usedPrefix}addstore <nama>*\n\nContoh:\n${usedPrefix}addstore promo`
      )
    }

    let key = text.trim().toLowerCase()
    if (key in msgs) {
      return m.reply(`❌ *"${text}"* sudah terdaftar di Store.`)
    }

    if (m.quoted) {
      try {
        const quoted = await m.getQuotedObj()
        const msg = proto.WebMessageInfo.fromObject(quoted).toJSON()
        msgs[key] = msg
        return m.reply(`✅ Berhasil menambahkan *"${text}"* ke Store dari pesan yang direply.`)
      } catch (e) {
        console.error(e)
        return m.reply("❌ Gagal menyimpan pesan.")
      }
    } else {
      msgs[key] = { text }
      return m.reply(`✅ Berhasil menambahkan *"${text}"* ke Store sebagai teks.`)
    }
  }

  // ================= LIST STORE =================
  if (cmd === 'liststore') {
    let keys = Object.keys(msgs)

    if (!keys.length) {
      return m.reply(
        `Belum ada List Store.\nKetik *${usedPrefix}addstore <nama>* untuk menambahkan.`
      )
    }

    let list = keys.map(v => `├ ${v}`).join('\n')

    return conn.reply(
      m.chat,
      `┌「 *Daftar Store* 」\n${list}\n└──────────`,
      m
    )
  }

  // ================= GET STORE =================
  if (cmd === 'getstore' || cmd === 'getmsg') {
    if (!text) {
      return m.reply(
        `Gunakan:\n*${usedPrefix}${cmd} <nama>*\n\nContoh:\n${usedPrefix}${cmd} promo`
      )
    }

    let key = text.trim().toLowerCase()
    if (!(key in msgs)) {
      return m.reply(`❌ Store *"${text}"* tidak ditemukan.`)
    }

    try {
      let data = msgs[key]

      if (data.text && !data.message) {
        return m.reply(data.text)
      }

      let _m = conn.serializeM(
        JSON.parse(JSON.stringify(data), (_, v) => {
          if (
            v !== null &&
            typeof v === 'object' &&
            v.type === 'Buffer' &&
            Array.isArray(v.data)
          ) {
            return Buffer.from(v.data)
          }
          return v
        })
      )

      await _m.copyNForward(m.chat, false)
    } catch (e) {
      console.error(e)
      return m.reply("❌ Gagal mengirim pesan dari Store.")
    }
  }

  // ================= DELETE STORE =================
  if (cmd === 'delstore') {
    if (!(isAdmin || isOwner)) return m.reply("❌ Khusus Admin / Owner.")

    if (!text) {
      return m.reply(
        `Gunakan:\n*${usedPrefix}delstore <nama>*\n\nContoh:\n${usedPrefix}delstore promo`
      )
    }

    let key = text.trim().toLowerCase()
    if (!(key in msgs)) {
      return m.reply(`❌ Store *"${text}"* tidak terdaftar.`)
    }

    delete msgs[key]
    return m.reply(`✅ Berhasil menghapus Store: *${text}*`)
  }
}

handler.help = [
  'addstore <nama>',
  'liststore',
  'getstore <nama>',
  'delstore <nama>'
]
handler.tags = ['store']
handler.command = /^(addstore|liststore|getstore|getmsg|delstore)$/i
handler.limit = false

export default handler