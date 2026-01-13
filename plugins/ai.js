import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(
`${usedPrefix + command} [model] [pesan]

Model yang tersedia:
- gpt-5-nano
- gpt-4o-mini
- gemini
- deepseek
- claude
- grok
- meta-ai
- qwen

Contoh:
${usedPrefix + command} claude jelaskan apa itu teori relativitas`
  )

  try {
    let [model, ...promptArr] = text.split(' ')
    model = model?.toLowerCase()
    let prompt = promptArr.join(' ')

    const modelList = {
      'gpt-4o-mini': '25865',
      'gpt-5-nano': '25871',
      'gemini': '25874',
      'deepseek': '25873',
      'claude': '25875',
      'grok': '25872',
      'meta-ai': '25870',
      'qwen': '25869'
    }

    if (!modelList[model]) {
      prompt = text
      model = 'gpt-5-nano'
    }

    if (!prompt) return m.reply(`Masukkan pesan!\nContoh: ${usedPrefix + command} ${model} halo!`)

    const { data: html } = await axios.post(
      `https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/')}&version=v2`
    )

    const nonce = html.result.content.match(/&quot;nonce&quot;\s*:\s*&quot;([^&]+)&quot;/)
    if (!nonce) throw new Error('Nonce not found.')

    const { data } = await axios.post(
      `https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/wp-admin/admin-ajax.php')}&version=v2`,
      new URLSearchParams({
        action: 'aipkit_frontend_chat_message',
        _ajax_nonce: nonce[1],
        bot_id: modelList[model],
        session_id: uuidv4(),
        conversation_uuid: uuidv4(),
        post_id: '6',
        message: prompt
      }).toString(),
      {
        headers: {
          origin: 'https://chatgptfree.ai',
          referer: 'https://chatgptfree.ai/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
      }
    )

    let reply = data?.result?.content?.data?.reply
    if (!reply) throw new Error('Gagal mendapatkan balasan dari AI.')

    await conn.reply(m.chat, reply, m)

  } catch (e) {
    m.reply(`❌ Terjadi kesalahan: ${e.message}`)
  }
}

handler.help = ['ai']
handler.tags = ['ai']
handler.command = /^ai$/i
handler.limit = true

export default handler