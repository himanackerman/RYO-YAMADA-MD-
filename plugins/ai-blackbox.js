/*
- Name : Blackbox Ai
- Deks : Apa Yah
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Source Scrape : https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/559
*/
import axios from 'axios'

async function CodeTeam(text) {
  let res = await axios.post('https://www.blackbox.ai/api/chat', {
    messages: [{ role: 'user', content: text, id: 'Cw0hPk9' }],
    id: 'NMxpOEZ',
    codeModelMode: true,
    trendingAgentMode: {},
    isMicMode: false,
    maxTokens: 1024,
    isChromeExt: false,
    githubToken: '',
    clickedForceWebSearch: false,
    visitFromDelta: true,
    isMemoryEnabled: false,
    mobileClient: true,
    validated: 'a38f5889-8fef-46d4-8ede-bf4668b6a9bb',
    imageGenerationMode: false,
    webSearchModePrompt: false,
    deepSearchMode: false,
    vscodeClient: false,
    codeInterpreterMode: false,
    customProfile: {
      name: '',
      occupation: '',
      traits: [],
      additionalInfo: '',
      enableNewChats: false
    },
    webSearchModeOption: {
      autoMode: true,
      webMode: false,
      offlineMode: false
    },
    isPremium: false,
    beastMode: false,
    designerMode: false,
    asyncMode: false
  }, {
    headers: {
      'authority': 'www.blackbox.ai',
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'cookie': 'sessionId=1ef130b0-ffe7-4e75-ae34-51867f22bb04; render_app_version_affinity=dep-d1qdojjipnbc738ulm6g; __Host-authjs.csrf-token=7244d98fbe034215e35b50442d4201a7542d8396b2e453c0648398994548b66f%7C7a8907ba3f9b4bbe58870a83b3f379b8db2877821cd898106b49058a8e83369e; __Secure-authjs.callback-url=https%3A%2F%2Fwww.blackbox.ai; intercom-id-x55eda6t=8f4dda0a-4f14-47ec-811a-a23d4ceffe81; intercom-session-x55eda6t=; intercom-device-id-x55eda6t=ce52817b-dcc5-4274-a773-c0545b640988',
      'origin': 'https://www.blackbox.ai',
      'referer': 'https://www.blackbox.ai/',
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  })

  let answer = res.data
  if (typeof answer !== 'string') answer = JSON.stringify(answer)
  answer = answer.replace(/\$~~~\$\[.*?\]\$~~~\$/gs, '*[ SEARCH MODE ]*')
  answer = answer.replace(/\*\*/g, '*')
  return answer
}

let handler = async (m, { args }) => {
  try {
    if (!args[0]) return m.reply('Mw Tanya Apa.')
    let text = args.join(' ')
    let result = await CodeTeam(text)
    m.reply(result)
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['blackbox']
handler.command = ['blackbox']
handler.tags = ['ai']
handler.limit = true 
handler.register = true 

export default handler