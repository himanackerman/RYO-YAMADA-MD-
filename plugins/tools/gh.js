/**
 * Fitur    : GitHub Tools
 * Type     : Plugins ESM
 * Creator  : Hilman
 * Channel  : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `${usedPrefix}${command} query`

  try {

    if (command === 'ghuser') {
      let res = await fetch(`https://api.github.com/users/${text}`)
      let json = await res.json()

      return m.reply(`👤 ${json.login}
📦 Repo: ${json.public_repos}
👥 Followers: ${json.followers}
🔗 ${json.html_url}`)
    }

    if (command === 'ghsearch') {
      let res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}`)
      let json = await res.json()

      let hasil = json.items.slice(0, 5).map(v => `
${v.full_name}
⭐ ${v.stargazers_count}
🔗 ${v.html_url}`).join('\n')

      return m.reply(hasil)
    }

    if (command === 'ghgist') {
      let url = text.trim()

      if (url.includes('gist.github.com')) {
        let id = url.split('/').pop()
        let res = await fetch(`https://api.github.com/gists/${id}`)
        let json = await res.json()

        for (let x in json.files) {
          let f = json.files[x]
          await m.reply('```' + f.content + '```')
        }

        return
      }

      if (url.includes('github.com')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
      }

      let res = await fetch(url)
      let textFile = await res.text()

      return m.reply('```' + textFile + '```')
    }

  } catch {
    throw 'Error'
  }
}

handler.help = ['ghuser', 'ghsearch', 'ghgist']
handler.tags = ['tools']
handler.command = /^(ghuser|ghsearch|ghgist)$/i
handler.limit = false

export default handler