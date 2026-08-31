import { chatgpt } from '../../lib/scrape/chatgpt.js'
import { delay } from 'baileys'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `— chatgpt prompt —\n\n` +
      `❀ usage : ${usedPrefix + command} <pertanyaan / pesan>\n` +
      `❀ example : ${usedPrefix + command} Siapa penemu listrik?`
    )
  }

  conn.chatgptSessions = conn.chatgptSessions || {}
  const sessionId = m.sender

  try {
    const session = conn.chatgptSessions[sessionId] || {}

    const result = await chatgpt(
      text.trim(),
      session.auth || null,
      session.chatId || null
    )

    if (!result.response) {
      throw new Error('Tidak mendapat respon dari ChatGPT.')
    }

    conn.chatgptSessions[sessionId] = {
      auth: result.auth,
      chatId: result.chatId
    }

    const response = result.response.trim()

    // Auto detect text dan code block
    const parts = response
      .split(/(```[\s\S]*?```)/g)
      .filter(part => part.trim())

    const rich = new AIRich(conn)
    let lastId = null
    let count = 0

    for (const part of parts) {
      const id = `part${count++}`
      const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/)

      const options = lastId
        ? { insertAt: lastId, id }
        : { id }

      if (codeMatch) {
        let language = codeMatch[1] || 'text'
        const code = codeMatch[2].trim()

        rich.addCode(
          language,
          code,
          options
        )
      } else {
        const content = part.trim()

        if (content) {
          rich.addText(
            content,
            options
          )
        }
      }

      if (!lastId) {
        await rich.send(m.chat, { quoted: m })
      } else {
        await delay(500)
        await rich.sendEdit()
      }

      lastId = id
    }

    await delay(500)

    rich.addSuggest([
      'Jelaskan lebih detail',
      'Berikan contoh',
      'Ringkas jawaban'
    ])

    await rich.sendEdit()

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message || e}`)
  }
}

handler.help = ['chatgpt']
handler.tags = ['ai']
handler.command = /^(chatgpt|ai)$/i
handler.limit = true
handler.register = false

export default handler