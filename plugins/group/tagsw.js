let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!m.isGroup) return m.reply('Khusus grup.')

let message

if (m.quoted?.mediaMessage) {
const mediaType = Object.keys(m.quoted.mediaMessage)[0]
const media = m.quoted.mediaMessage[mediaType]

media.contextInfo = {
  ...(media.contextInfo || {}),
  statusSourceType: 4,
  statusAttributions: [
    {
      type: 10
    }
  ],
  statusAudienceMetadata: {
    audienceType: 1
  }
}

message = {
  [mediaType]: media
}

} else if (m.quoted) {
message = {
extendedTextMessage: {
text: m.quoted.text || m.quoted.caption || '',
textArgb: 4294967295,
backgroundArgb: 4280669030,
font: 5,
previewType: 0,
contextInfo: {
forwardingScore: 0,
featureEligibilities: {
canBeReshared: true,
canReceiveMultiReact: true
},
statusSourceType: 4,
statusAttributions: [
{
type: 10
}
],
statusAudienceMetadata: {
audienceType: 1
}
},
inviteLinkGroupTypeV2: 0
}
}
} else if (text) {
message = {
extendedTextMessage: {
text,
textArgb: 4294967295,
backgroundArgb: 4280669030,
font: 5,
previewType: 0,
contextInfo: {
forwardingScore: 0,
featureEligibilities: {
canBeReshared: true,
canReceiveMultiReact: true
},
statusSourceType: 4,
statusAttributions: [
{
type: 10
}
],
statusAudienceMetadata: {
audienceType: 1
}
},
inviteLinkGroupTypeV2: 0
}
}
} else {
return m.reply(
"Contoh:\n${usedPrefix + command} Halo semua\n\nAtau reply media/pesan"
)
}

try {
await conn.relayMessage(
m.chat,
{
messageContextInfo: {
messageSecret:
'BrRzGQ6/B0ddqBuasejEf+rJKLQ2pauxHtAw1nIMPvw='
},
groupStatusMessageV2: {
message
}
},
{}
)

m.reply('✅ Status grup berhasil dikirim')

} catch (e) {
console.error(e)
m.reply("❌ Gagal mengirim status grup\n\n${e.message || e}")
}
}

handler.help = ['swgc']
handler.tags = ['group']
handler.command = /^(swgc|upswgc)$/i
handler.group = true
handler.admin = true
handler.register = true

export default handler