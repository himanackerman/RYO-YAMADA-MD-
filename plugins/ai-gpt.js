/*
AI GPT ONLINE
Type : Plugin ESM
WM Scrape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C
*/

import axios from 'axios'
import FormData from 'form-data'

async function gptOnline(message) {
  const referer = 'https://gptonline.ai/id/chatgpt-online'

  try {
    const html = (await axios.get(referer)).data
    const attrs = {}
    const attrList = ['nonce', 'post-id', 'bot-id', 'url']

    for (const key of attrList) {
      const match = html.match(new RegExp(`data-${key}="([^"]+)"`))
      if (!match) throw new Error(`Attribute ${key} tidak ditemukan`)
      attrs[key] = match[1]
    }

    const form = new FormData()
    const clientId = 'sU' + Math.random().toString(36).slice(2, 10)

    form.append('_wpnonce', attrs['nonce'])
    form.append('post_id', attrs['post-id'])
    form.append('url', attrs['url'])
    form.append('action', 'wpaicg_chat_shortcode_message')
    form.append('message', message)
    form.append('bot_id', attrs['bot-id'])
    form.append('chatbot_identity', `custom_bot_${attrs['bot-id']}`)
    form.append('wpaicg_chat_history', JSON.stringify([{ role: 'user', content: message }]))
    form.append('wpaicg_chat_client_id', clientId)

    const res = await axios.post(
      'https://gptonline.ai/id/wp-admin/admin-ajax.php',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Referer: referer,
          Origin: 'https://gptonline.ai',
          'User-Agent': 'Mozilla/5.0',
        }
      }
    )

    return res.data?.data || '❌ Tidak ada respon dari AI.'
  } catch (err) {
    return `❌ Error: ${err.response?.data || err.message}`
  }
}

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🚨 Contoh:\n${usedPrefix + command} apa itu hologram`

  let res = await gptOnline(text)
  m.reply(res)
}

handler.help = ['gptonline <teks>', 'gpt <teks>']
handler.tags = ['ai']
handler.command = /^(gptonline|gpt)$/i
handler.limit = true
handler.register = true 

export default handler