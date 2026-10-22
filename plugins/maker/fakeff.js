// fake ff 
// note : instal dulu npm i fake-ff

import generateFF from 'fake-ff'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [username, lobbyInput] = text ? text.split('|') : []

  if (!username && !text) {
    throw `*— FAKE FF LOBBY —*\n\n` +
          `Format : *${usedPrefix + command} <nama|lobby>*\n` +
          `Contoh : *${usedPrefix + command} mark | 3*\n` +
          `Info : Pilihan lobby tersedia dari 1 - 30`
  }

  const name = username?.trim() || m.pushName || 'Ditzzx'
  const selectedLobby = lobbyInput ? parseInt(lobbyInput.trim()) : Math.floor(Math.random() * 30) + 1

  await m.react('🕒')

  try {
    const res = await generateFF({
      username: name,
      lobby: selectedLobby
    })

    if (!res || !res.result) {
      throw new Error('Gagal me-render Fake FF Lobby.')
    }

    const originalPath = path.resolve(res.result)

    if (!fs.existsSync(originalPath)) {
      throw new Error('File hasil render tidak ditemukan.')
    }

    const tmpDir = path.resolve('./tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const fileName = path.basename(originalPath)
    const tmpPath = path.join(tmpDir, fileName)

    fs.renameSync(originalPath, tmpPath)

    const fakeFfDir = path.dirname(originalPath)
    if (fs.existsSync(fakeFfDir) && fs.readdirSync(fakeFfDir).length === 0) {
      fs.rmdirSync(fakeFfDir)
    }

    const buffer = fs.readFileSync(tmpPath)

    try {
      fs.unlinkSync(tmpPath)
    } catch (e) {}

    const caption =
      `*— FAKE FF LOBBY —*\n\n` +
      `Username : ${name}\n` +
      `Lobby ID : #${selectedLobby}`

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: caption
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    await m.reply(`❌ Error: ${e.message || e}`)
  }
}

handler.help = ['fakeff']
handler.tags = ['maker']
handler.command = /^(fakeff|fflobby)$/i

export default handler