import axios from 'axios'

async function amdata(url) {
  try {
    let match = url.match(/\/u\/([^\/]+)\/p\/([^\/\?#]+)/)
    if (!match) throw new Error('Invalid url')
    let { data } = await axios.post('https://us-central1-alight-creative.cloudfunctions.net/getProjectMetadata', {
      data: {
        uid: match[1],
        pid: match[2],
        platform: 'android',
        appBuild: 1002592,
        acctTestMode: 'normal'
      }
    }, {
      headers: { 'content-type': 'application/json; charset=utf-8' }
    })
    return data.result?.info
  } catch (e) {
    throw new Error(e.message)
  }
}

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return m.reply('Mana Link Preset Am Nya?')
    let info = await amdata(args[0])
    let {
      title, amVersionString, amPackageVersion, size, downloads, likes,
      requiredEffects, shareDate, largeThumbUrl, medThumbUrl, smallThumbUrl
    } = info

    let efek = requiredEffects?.map((v, i) => `${i + 1}. ${v}`).join('\n') || ''
    let tanggal = shareDate?._seconds ? new Date(shareDate._seconds * 1000).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Tidak diketahui'

    let text = `${title}
    
Version : ${amVersionString}
Build : ${amPackageVersion}
Size : ${(size / 1024 / 1024).toFixed(2)} MB
Total Download : ${downloads}
Like : ${likes}
Upload Date : ${tanggal}
All Effect :
${efek}
Link : ${args[0]}`

    await conn.sendMessage(m.chat, { image: { url: largeThumbUrl }, caption: text }, { quoted: m })
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['amdata']
handler.command = ['amdata', 'presetam']
handler.tags = ['tools']

export default handler