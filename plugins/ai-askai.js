/*
 `[ AskAI ]`
 type : plugins esm 
 sumber scrape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3858
 */
 
import axios from 'axios'

const models = {
  'ChatGPT-4o': 'chatgpt-4o',
  'ChatGPT-4o Mini': 'chatgpt-4o-mini',
  'Claude 3 Opus': 'claude-3-opus',
  'Claude 3.5 Sonnet': 'claude-3-sonnet',
  'Llama 3': 'llama-3',
  'Llama 3.1 (Pro)': 'llama-3-pro',
  'Perplexity AI': 'perplexity-ai',
  'Mistral Large': 'mistral-large',
  'Gemini 1.5 Pro': 'gemini-1.5-pro'
}

// Pencocokan model berdasarkan input mirip
function findClosestModel(input) {
  input = input.toLowerCase()
  let match = Object.keys(models).find(name => name.toLowerCase() === input)
  if (match) return match

  let scores = Object.keys(models).map(name => {
    const lower = name.toLowerCase()
    const score = lower.includes(input) ? 100 : 0
    return { name, score }
  })

  scores.sort((a, b) => b.score - a.score)
  return scores[0].score > 0 ? scores[0].name : null
}

async function askAI(prompt, modelKey) {
  const model = models[modelKey]
  if (!model) return `❌ Model *"${modelKey}"* tidak tersedia.`

  try {
    const { data } = await axios.post('https://whatsthebigdata.com/api/ask-ai/', {
      message: prompt,
      model,
      history: []
    }, {
      headers: {
        'content-type': 'application/json',
        'origin': 'https://whatsthebigdata.com',
        'referer': 'https://whatsthebigdata.com/ai-chat/',
        'user-agent': 'Mozilla/5.0'
      }
    })

    if (data?.text) return `*Model:* ${modelKey}\n\n*Jawaban:*\n${data.text}`
    return '❌ Tidak ada respon dari model.'
  } catch (e) {
    return `❌ Terjadi error: ${e.response?.status === 400 ? 'Prompt dilarang oleh model.' : e.message}`
  }
}

let handler = async (m, { text, args, command }) => {
  const modelList = Object.keys(models)

  if (command === 'listmodel') {
    let list = modelList.map((v, i) => `${i + 1}. ${v}`).join('\n')
    return m.reply(`📚 *List Model yang Tersedia:*\n\n${list}\n\nGunakan: *.askai [model] [pertanyaan]*`)
  }

  if (!args[1]) return m.reply(`Contoh:\n.askai Claude 3.5 Sonnet cara farming cepat`)

  const modelGuess = args.slice(0, 3).join(' ')
  const prompt = text.replace(modelGuess, '').trim()

  const modelName = findClosestModel(modelGuess)

  if (!modelName) {
    return m.reply(`❌ Model *"${modelGuess}"* tidak dikenali.\nKetik *.listmodel* untuk melihat daftar model.`)
  }

  if (!prompt) return m.reply('❌ Masukkan pertanyaanmu.')

  let res = await askAI(prompt, modelName)
  m.reply(res)
}

handler.help = ['askai <model> <pertanyaan>', 'listmodel']
handler.tags = ['ai']
handler.command = /^askai|listmodel$/i
handler.limit = true

export default handler