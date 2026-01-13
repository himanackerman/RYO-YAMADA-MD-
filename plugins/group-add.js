const { getBinaryNodeChild, getBinaryNodeChildren } = (await import('@adiwajshing/baileys')).default
import fetch from 'node-fetch'

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
  if (!text) throw `⚠️ Masukkan nomor yang ingin ditambahkan!\n\n📌 Contoh:\n${usedPrefix + command} ${global.owner[0]}`

  await m.react('🕒')
  await m.reply('⏳ Sedang diproses, tunggu sebentar...')

  let _participants = participants.map(user => user.id)
  let users = (await Promise.all(
    text.split(',')
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(v => v.length > 4 && v.length < 20 && !_participants.includes(v + '@s.whatsapp.net'))
      .map(async v => [v, await conn.onWhatsApp(v + '@s.whatsapp.net')])
  )).filter(v => v[1][0]?.exists).map(v => v[0] + '@c.us')

  if (!users.length) {
    await m.react('❌')
    return m.reply('❌ Nomor tidak valid atau sudah ada di grup.')
  }

  const response = await conn.query({
    tag: 'iq',
    attrs: {
      type: 'set',
      xmlns: 'w:g2',
      to: m.chat,
    },
    content: users.map(jid => ({
      tag: 'add',
      attrs: {},
      content: [{ tag: 'participant', attrs: { jid } }]
    }))
  })

  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null)
  const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0)
  const participant = getBinaryNodeChildren(response, 'add')

  if (!participant[0]) {
    await m.react('❌')
    return m.reply('❌ Gagal menambahkan anggota.')
  }

  // Handle gagal 408 (sudah keluar/kick)
  let gagal408 = participant[0].content.filter(v => v.attrs.error == 408)
  if (gagal408.length) {
    for (const gagal of gagal408) {
      let nomor = gagal.attrs.jid.split('@')[0]
      await conn.reply(m.chat, `⚠️ Tidak dapat menambahkan @${nomor} karena baru keluar atau di-kick.`, m, {
        mentions: [gagal.attrs.jid]
      })
    }
  }

  // Handle undang pakai invite link (403)
  let undang403 = participant[0].content.filter(v => v.attrs.error == 403)
  if (undang403.length) {
    for (const user of undang403) {
      const jid = user.attrs.jid
      const content = getBinaryNodeChild(user, 'add_request')
      const invite_code = content.attrs.code
      const invite_code_exp = content.attrs.expiration
      let txt = `📨 Mengundang @${jid.split('@')[0]} menggunakan link undangan...`
      await m.reply(txt, null, {
        mentions: [jid]
      })
      await conn.sendGroupV4Invite(
        m.chat,
        jid,
        invite_code,
        invite_code_exp,
        await conn.getName(m.chat),
        'Undangan untuk bergabung ke grup WhatsApp saya',
        jpegThumbnail
      )
    }
  }

  await m.react('✅')
  await m.reply(`✅ *Berhasil memproses permintaan.*\n\n📥 Jumlah nomor diproses: *${users.length}*`)
}

handler.help = ['add', '+'].map(v => v + ' @user/628xxxx')
handler.tags = ['group']
handler.command = /^(add|\+)$/i

handler.admin = true
handler.group = true
handler.botAdmin = true
handler.fail = null

export default handler