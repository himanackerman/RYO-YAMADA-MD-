import axios from 'axios'

const supportedLanguages = [
  'JavaScript', 'C#', 'C++', 'Java', 'Ruby', 'Go', 'Python', 'Custom'
]

const supportedModels = [
  'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo',
  'claude-3-opus', 'claude-3-5-sonnet'
]

async function generateCode(prompt, language = 'JavaScript', model = 'gpt-4o-mini') {
  if (!supportedLanguages.includes(language)) {
    return {
      status: false,
      error: `Bahasa ga ada. Pilih salah satu: ${supportedLanguages.join(', ')}`
    }
  }

  if (!supportedModels.includes(model)) {
    return {
      status: false,
      error: `Model AI ga ada. Pilih salah satu: ${supportedModels.join(', ')}`
    }
  }

  const finalPrompt = language === 'Custom'
    ? prompt
    : `Tulis kode dalam bahasa ${language} untuk: ${prompt}`

  try {
    const response = await axios.post(
      'https://best-ai-code-generator.toolzflow.app/api/chat/public',
      {
        chatSettings: {
          model: model,
          temperature: 0.3,
          contextLength: 16385,
          includeProfileContext: false,
          includeWorkspaceInstructions: false,
          includeExampleMessages: false
        },
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that writes code in requested language.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'code_response',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Generated code' }
              },
              required: ['code']
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://best-ai-code-generator.toolzflow.app',
          'Referer': 'https://best-ai-code-generator.toolzflow.app/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }
    )

    const rawCode = response.data?.code || ''
    const formattedCode = rawCode
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')

    return {
      status: true,
      code: formattedCode.trim() || 'Ga ada kode yang dihasilkan.'
    }
  } catch (e) {
    return {
      status: false,
      error: `Request gagal: ${e.message}`
    }
  }
}

// handler command
let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  if (!text) throw `Contoh:\n${usedPrefix + command} buat validasi otp|Python|gpt-4o-mini`

  let [prompt, language = 'JavaScript', model = 'gpt-4o-mini'] = text.split('|').map(v => v.trim())

  let res = await generateCode(prompt, language, model)

  if (!res.status) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    throw res.error
  }

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
  await conn.reply(m.chat, `*Hasil Kode:*\n\n\`\`\`${res.code}\`\`\``, m)
}

handler.help = ['aicode'].map(v => v + ' <prompt>|<bahasa>|<model>')
handler.tags = ['ai']
handler.command = /^aicode$/i
handler.limit = true
handler.register = true

export default handler