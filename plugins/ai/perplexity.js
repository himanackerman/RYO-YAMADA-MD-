import https from 'https'

async function eaiquery(prompt, model = "perplexity-ai") {

  return new Promise((resolve, reject) => {

    let postData = JSON.stringify({

      message: prompt,

      model: model,

      history: []

    })

    let options = {

      hostname: 'whatsthebigdata.com',

      port: 443,

      path: '/api/ask-ai/',

      method: 'POST',

      headers: {

        'content-type': 'application/json',

        'origin': 'https://whatsthebigdata.com',

        'referer': 'https://whatsthebigdata.com/ai-chat/',

        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'

      }

    }

    let req = https.request(options, res => {

      let data = ''

      res.on('data', chunk => data += chunk)

      res.on('end', () => {

        try {

          let result = JSON.parse(data)

          resolve(result.text)

        } catch (e) {

          reject(e.message)

        }

      })

    })

    req.on('error', e => reject(e.message))

    req.write(postData)

    req.end()

  })

}

let handler = async (m, { args }) => {

  let query = args.join(' ')

  if (!query) return m.reply('Mau Tanya Apa')

  try {

    m.reply(await eaiquery(query))

  } catch (e) {

    m.reply(e.message)

  }

}

handler.help = ['perplexity']

handler.command = ['perplexity', 'plx']

handler.tags = ['ai']

export default handler