/* 
Fitur : Downloader IG Story 
Type : Plugins ESM 
Source Scrape: https://whatsapp.com/channel/0029VbANq6v0VycMue9vPs3u/334
*/
import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'

let handler = async (m, { conn, text, args }) => {
  if (!text) throw 'Masukkan link Instagram Story!\nContoh: .igst https://www.instagram.com/stories/kitsunee.___/'
  if (!/^https:\/\/www\.instagram\.com\/stories\/[a-zA-Z0-9_.]+\/?/.test(text)) throw 'URL Instagram Story tidak valid!'

  try {
    m.reply('🔄 Sedang mengambil story...')

    const url = text
    const tokenForm = new FormData()
    tokenForm.append('url', url)
    const { data: tokenData } = await axios.post('https://savevid.net/api/userverify', tokenForm, {
      headers: tokenForm.getHeaders()
    })

    const form = new FormData()
    form.append('q', url)
    form.append('t', 'media')
    form.append('lang', 'en')
    form.append('v', 'v2')
    form.append('cftoken', tokenData.token)

    const { data } = await axios.post('https://v3.savevid.net/api/ajaxSearch', form, {
      headers: form.getHeaders()
    })

    const $ = cheerio.load(data.data)
    const links = []

    $('ul.download-box > li').each((_, el) => {
      const dl = $(el).find('.download-items__btn:not(.dl-thumb) a').attr('href')
      if (dl) links.push(dl)
    })

    if (!links.length) throw 'Tidak ada media ditemukan di story tersebut.'

    for (const link of links) {
      await conn.sendFile(m.chat, link, 'story.mp4', '', m, { asDocument: true })
      await delay(2000) // jeda agar tidak ke rate-limit
    }

  } catch (e) {
    throw `Gagal mengambil story: ${e.message}`
  }
}

handler.help = ['igst', 'igstory']
handler.tags = ['downloader']
handler.command = /^igst|igstory$/i
handler.limit = true

export default handler

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}