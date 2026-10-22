/* 
`[ Cari Grup ]`
type : plugins esm 
sumber scrape : https://whatsapp.com/channel/0029VafzAqeFSAszE4uo132D/384
*/

import axios from 'axios'
import cheerio from 'cheerio'

async function searchGroups(keywords) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Referer": "https://groupda1.link/add/group/search",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html, */*; q=0.01",
    "Host": "groupda1.link",
    "Origin": "https://groupda1.link",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
  }

  const results = []
  const keywordList = keywords.split(',')

  for (const name of keywordList) {
    const keyword = name.trim()

    let loop_count = 0

    while (loop_count < 5) {
      const data = {
        group_no: `${loop_count}`,
        search: true,
        keyword: keyword
      }

      try {
        const response = await axios.post(
          "https://groupda1.link/add/group/loadresult",
          new URLSearchParams(data),
          { headers, timeout: 10000 }
        )

        if (response.status !== 200 || !response.data || response.data.length === 0) break

        const $ = cheerio.load(response.data)
        let found = false

        for (const maindiv of $('.maindiv').toArray()) {
          const tag = $(maindiv).find('a[href]')
          if (!tag.length) continue

          const link = tag.attr('href')
          const title = tag.attr('title')?.replace('Whatsapp group invite link: ', '') || 'Tanpa Nama'
          const description_tag = $(maindiv).find('p.descri')
          const description = description_tag.text().trim() || 'Tidak ada deskripsi'
          const group_id = link.split('/').pop()
          const group_link = `https://chat.whatsapp.com/${group_id}`

          if (!results.some(g => g.Code === group_id)) {
            results.push({
              Name: title,
              Code: group_id,
              Link: group_link,
              Description: description,
              Keyword: keyword
            })
            found = true
          }
        }

        if (!found) break
        loop_count++
        await new Promise(r => setTimeout(r, 1000))

      } catch (error) {
        break
      }
    }
  }

  return results
}

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `🚨 Contoh:\n${usedPrefix + command} programming,coding,belajar`

  m.reply('⏳ Sedang mencari grup, tunggu sebentar...')

  try {
    const groups = await searchGroups(text)

    if (!groups.length) return m.reply('❌ Tidak ada grup ditemukan.')

    let teks = `📋 *Hasil Pencarian Grup WhatsApp:*\n\n`
    groups.forEach((group, i) => {
      teks += `*${i + 1}. 📌 Nama:* ${group.Name}\n`
      teks += `🔗 *Link:* ${group.Link}\n`
      teks += `📝 *Deskripsi:* ${group.Description}\n`
      teks += `🔍 *Keyword:* ${group.Keyword}\n\n`
    })
    teks += `✅ *Total Grup Ditemukan:* ${groups.length}`

    m.reply(teks)

  } catch (e) {
    m.reply(`❌ Terjadi error: ${e.message}`)
  }
}

handler.help = ['carigrup <keyword1,keyword2>']
handler.tags = ['search']
handler.command = /^carigrup$/i
handler.limit = true
handler.premium = true

export default handler