let handler = m => m

handler.before = async function (m, { isBotAdmin, isAdmin }) {
  let chat = global.db.data.chats[m.chat]
  let text = m.text || ''

  if (!chat?.antiPromosi) return
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (isAdmin) return

  let promoRegex = /(murah|promo|promosi|jualan|open jasa|open murid|panel|nokos|sewa bot|jastip|open admin|join grup|join gc|benefit|testimoni|order|ready stock|hubungi|wa\.me|https?:\/\/chat\.whatsapp\.com)/i

  if (promoRegex.test(text)) {
    await this.sendMessage(m.chat, {
      delete: m.key
    })

    await m.reply('🚫 Promosi tidak diperbolehkan di grup ini')
  }
}

export default handler