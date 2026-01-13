/*
* Nama fitur : Tiktok Downloader
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6Zs8yEgGfRQWWWp639
* Author : ZenzzXD
 */

import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'
import moment from 'moment-timezone'

async function tiktokV1(query) {
  const encodedParams = new URLSearchParams()
  encodedParams.set('url', query)
  encodedParams.set('hd', '1')

  const { data } = await axios.post('https://tikwm.com/api/', encodedParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: 'current_language=en',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    }
  })

  return data
}

async function tiktokV2(query) {
  const form = new FormData()
  form.append('q', query)

  const { data } = await axios.post('https://savetik.co/api/ajaxSearch', form, {
    headers: {
      ...form.getHeaders(),
      'Accept': '*/*',
      'Origin': 'https://savetik.co',
      'Referer': 'https://savetik.co/en2',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  const rawHtml = data.data
  const $ = cheerio.load(rawHtml)
  const title = $('.thumbnail .content h3').text().trim()
  const thumbnail = $('.thumbnail .image-tik img').attr('src')
  const video_url = $('video#vid').attr('data-src')

  const slide_images = []
  $('.photo-list .download-box li').each((_, el) => {
    const imgSrc = $(el).find('.download-items__thumb img').attr('src')
    if (imgSrc) slide_images.push(imgSrc)
  })

  return { title, thumbnail, video_url, slide_images }
}

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply('masukin url tiktok woy, contoh : .tiktok https://vt.tiktok.com/xxxxxx')

  await m.react('✨')

  try {
    let res
    let images = []

    const dataV1 = await tiktokV1(text)
    if (dataV1?.data) {
      const d = dataV1.data
      if (Array.isArray(d.images) && d.images.length > 0) {
        images = d.images
      } else if (Array.isArray(d.image_post) && d.image_post.length > 0) {
        images = d.image_post
      }
      res = {
        title: d.title,
        region: d.region,
        duration: d.duration,
        create_time: d.create_time,
        play_count: d.play_count,
        digg_count: d.digg_count,
        comment_count: d.comment_count,
        share_count: d.share_count,
        download_count: d.download_count,
        author: {
          unique_id: d.author?.unique_id,
          nickname: d.author?.nickname
        },
        music_info: {
          title: d.music_info?.title,
          author: d.music_info?.author
        },
        cover: d.cover,
        play: d.play,
        hdplay: d.hdplay,
        wmplay: d.wmplay
      }
    }

    const dataV2 = await tiktokV2(text)
    if ((!res?.play && images.length === 0) && dataV2.video_url) {
      res = res || { play: dataV2.video_url }
    }
    if (Array.isArray(dataV2.slide_images) && dataV2.slide_images.length > 0) {
      images = dataV2.slide_images
    }

    if (images.length > 0) {
      await m.reply(`terdeteksi gambar ${images.length} wett`)
      for (const img of images) {
        await conn.sendMessage(m.chat, {
          image: { url: img },
          caption: res.title || ''
        }, { quoted: m })
      }
      return
    }

    const time = res.create_time
      ? moment.unix(res.create_time).tz('Asia/Jakarta').format('dddd, D MMMM YYYY [pukul] HH:mm:ss')
      : '-'

    const caption = `*Video tiktok info*
*Judul :* ${res.title || '-'}
*Region :* ${res.region || 'N/A'}
*Durasi :* ${res.duration || '-'}s
*Waktu Upload :* ${time}

*Statistik*
*Views :* ${res.play_count || 0}
*Likes :* ${res.digg_count || 0}
*komentar :* ${res.comment_count || 0}
*Share :* ${res.share_count || 0}
*Downloads :* ${res.download_count || 0}

*Author*
*Username :* ${res.author?.unique_id || '-'}
*Nama :* ${res.author?.nickname || '-'}`

    const videoUrl = res.play || res.hdplay || res.wmplay
    if (videoUrl) {
      await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m })
    } else if (res.cover) {
      await conn.sendMessage(m.chat, { image: { url: res.cover }, caption: 'cover_video' }, { quoted: m })
    }
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.command = ['tiktok', 'tt', 'ttdl']
handler.help = ['tiktok <url>']
handler.tags = ['downloader']
handler.limit = true

export default handler