/*
- Name : Play ( SoundCloud )
- Deks : Gtw Asal Share Ja
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Source Scrape : https://whatsapp.com/channel/0029VakezCJDp2Q68C61RH2C/3877
*/
import axios from 'axios'

async function searchSoundCloud(query) {
  const response = await axios.get('https://izumi-apis.zone.id/search/soundcloudsrc', {
    params: { query }
  })
  if (response.data?.status && response.data?.result?.length > 0) {
    return response.data.result[0]
  } else {
    return null
  }
}

async function SoundCloud(trackUrl) {
  const response = await axios.post(
    'https://api.downloadsound.cloud/track',
    { url: trackUrl },
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://downloadsound.cloud/',
        'Origin': 'https://downloadsound.cloud/',
        'Content-Type': 'application/json'
      }
    }
  )

  const data = response.data

  return {
    url: data?.url || null,
    title: data?.title || null,
    author: data?.author || {},
    thumbnail: data?.imageURL
  }
}

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return m.reply('Mw Cari Lagu Apa')

    m.reply('Search...')

    const search = await searchSoundCloud(args.join(' '))

    const result = await SoundCloud(search.url)

    let text = `*°${result.title}*
    
Author: ${result.author.username}
Followers: ${result.author.followers_count}
Likes: ${result.author.likes_count}
Country : ${result.author.country_code}
Verified : ${result.author.verified ? 'Yes' : 'No'}
Created : ${result.author.created_at}
Link : ${result.author.permalink_url}

> Please Wait Sending Audio`

    if (result.thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: result.thumbnail },
        caption: text
      }, { quoted: m })
    } else {
      await m.reply(text)
    }

    await conn.sendMessage(m.chat, {
      audio: { url: result.url },
      mimetype: 'audio/mpeg',
      fileName: `${result.title}.mp3`
    }, { quoted: m })

  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['soundcloud']
handler.command = ['soundcloud', 'plays']
handler.tags = ['downloader']
handler.limit = true 

export default handler