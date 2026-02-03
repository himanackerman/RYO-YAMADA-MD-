/*• Nama Fitur : Pinterest Search
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbB8WYS4CrfhJCelw33j
• Author : Agas
*/

import axios from 'axios'
const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = (await import('@adiwajshing/baileys')).default

async function pinterestApi(query) {
  const { data } = await axios.get(
    `https://api.deline.web.id/search/pinterest?q=${encodeURIComponent(query)}`
  )
  const arr = Array.isArray(data?.data) ? data.data : []
  return arr.map((it, idx) => ({
    title: it.caption && it.caption.trim() ? it.caption : `Gambar - ${idx + 1}`,
    url: it.image,
    source: it.source || ''
  }))
}

async function createImage(url, conn) {
  const { imageMessage } = await generateWAMessageContent(
    { image: { url } },
    { upload: conn.waUploadToServer }
  )
  return imageMessage
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Mau cari apa?')
  await m.reply('🔍 Mencari gambar...')

  try {
    let results = await pinterestApi(text)
    let selected = results.slice(0, 10)

    let cards = []
    for (let item of selected) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: 'Hasil pencarian Pinterest'
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'Ryo Yamada - MD' }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: item.title,
          hasMediaAttachment: true,
          imageMessage: await createImage(item.url, conn)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Lihat Pinterest',
                url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(text)}`
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: 'Buka Pin Sumber',
                url: item.source || item.url
              })
            }
          ]
        })
      })
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: 'Berikut hasilnya:' }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Pinterest' }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    m.reply('❌ Gagal mengambil hasil Pinterest.')
  }
}

handler.command = ['pingeser', 'pinterest', 'pinges', 'pin']
handler.help = ['pingeser','pinterest']
handler.tags = ['internet']
handler.register = true
handler.limit = true

export default handler