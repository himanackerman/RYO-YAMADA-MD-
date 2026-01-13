import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

async function aichat(question, { model = 'gpt-5-nano' } = {}) {
  try {
    const _model = {
      'gpt-4o-mini': '25865',
      'gpt-5-nano': '25871',
      'gemini': '25874',
      'deepseek': '25873',
      'claude': '25875',
      'grok': '25872',
      'meta-ai': '25870',
      'qwen': '25869'
    }

    if (!question) throw new Error('Question is required.')
    if (!_model[model]) throw new Error(`Available models: ${Object.keys(_model).join(', ')}.`)

    const { data: html } = await axios.post(`https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/')}&version=v2`)
    const nonce = html.result.content.match(/&quot;nonce&quot;\s*:\s*&quot;([^&]+)&quot;/)
    if (!nonce) throw new Error('Nonce not found.')

    const { data } = await axios.post(
      `https://api.nekolabs.web.id/px?url=${encodeURIComponent('https://chatgptfree.ai/wp-admin/admin-ajax.php')}&version=v2`,
      new URLSearchParams({
        action: 'aipkit_frontend_chat_message',
        _ajax_nonce: nonce[1],
        bot_id: _model[model],
        session_id: uuidv4(),
        conversation_uuid: uuidv4(),
        post_id: '6',
        message: question
      }).toString(),
      {
        headers: {
          origin: 'https://chatgptfree.ai',
          referer: 'https://chatgptfree.ai/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
      }
    )

    return data.result.content.data.reply
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { command, text }) => {
  try {
    if (!text) return m.reply(`*Example :* .${command} Apa Itu Nodejs`)
    let model
    switch (command) {
      case 'deepseek':
        model = 'deepseek'
      break
      case 'gpt-4o-mini':
        model = 'gpt-4o-mini'
      break
      case 'gpt-5-nano':
        model = 'gpt-5-nano'
      break
      case 'gemini':
        model = 'gemini'
      break
      case 'claude':
        model = 'claude'
      break
      case 'grok':
        model = 'grok'
      break
      case 'meta-ai':
        model = 'meta-ai'
      break
      case 'qwen':
        model = 'qwen'
      break
      default:
        model = 'gpt-5-nano'
      break
    }
    let result = await aichat(text, { model })
    m.reply(`${result}`)
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['deepseek','qwen','claude','gpt-4o-mini','gpt-5-nano','gemini','grok','meta-ai']
handler.command = ['deepseek','qwen','claude','gpt-4o-mini','gpt-5-nano','gemini','grok','meta-ai']
handler.tags = ['ai']

export default handler