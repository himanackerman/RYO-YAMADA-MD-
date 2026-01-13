import fs from 'fs'

let handler = async (m, { conn }) => {
  let name = await conn.getName(m.sender)

  // Auto greeting WIB
  let hour = new Date().getHours() + 7
  if (hour >= 24) hour -= 24
  let greeting = 'Selamat malam'
  if (hour >= 4 && hour < 11) greeting = 'Selamat pagi'
  else if (hour >= 11 && hour < 15) greeting = 'Selamat siang'
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore'

  let caption = `
${greeting}, *${name}!*
Berikut informasi mengenai bot ini:

┏━━  *BOT INFORMATION*  ━━┓
┃ *✨ Bot name:* Ryo Yamada
┃ *👑 Creator:* Hilman
┃ *⚙️ Version:* 9.0.0
┃ *📦 Type:* Plugins ESM
┗━━━━━━━━━━━━━━━━━━━━┛

*🍭 List Menu:*
. allmenu
. menuanime
. menuai
. menuaudio
. menudownload
. menufun
. menugame
. menugroup
. menuinfo
. menuinternet
. menunsfw
. menuowner
. menupanel
. menusearch
. menusticker
. menutools
`.trim()

  // Kirim pesan dengan gambar + tombol
  await conn.sendMessage(m.chat, {
    image: fs.readFileSync('./media/ryo2.jpg'),
    caption,
    footer: 'Ryo Yamada - MD',
    buttons: [
      { buttonId: '.allmenu', buttonText: { displayText: '✨ All Menu' }, type: 1 },
      { buttonId: '.sc', buttonText: { displayText: '✨ Script' }, type: 1 }
    ],
    headerType: 4,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: 'Ryo Yamada WhatsApp Bot',
        body: 'Multifungsi',
        thumbnail: fs.readFileSync('./media/ryo1.jpg'),
        sourceUrl: 'https://t.me/HlmnXD',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  // Kirim voice note (audio)
  try {
    await conn.sendFile(
      m.chat,
      'https://files.catbox.moe/7fje2p.mp3',
      'menu.mp3',
      null,
      m,
      true,
      {
        type: 'audioMessage',
        ptt: true,
        seconds: 0
      }
    )
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^menu$/i

export default handler