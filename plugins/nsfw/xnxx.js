import axios from 'axios'
import * as cheerio from 'cheerio'

export class Xnxx {
  constructor(proxy = 'https://uncors.netlify.app/?destination=') {
    this.proxy = proxy
  }

  async search(query, page = 1) {
    try {
      if (!query) throw new Error('Query is required.')
      if (isNaN(page)) throw new Error('Page must be a number.')

      const { data } = await axios.get(`${this.proxy}https://www.xnxx.com/search/${encodeURIComponent(query)}/${page}`)
      const $ = cheerio.load(data)

      const results = []
      $('div[id*="video_"]').each((_, el) => {
        const id = $(el).attr('data-id')
        const eid = $(el).attr('data-eid')
        const isChannel = $(el).attr('data-is-channel') === '1'
        
        let titleAttr = $(el).find('.thumb-under p:first-of-type a').attr('title')
        let titleText = $(el).find('.thumb-under p:first-of-type a').text().trim()
        let title = titleText
        if (titleAttr) {
          title = titleAttr
        }

        const url = $(el).find('.thumb-inside .thumb a').attr('href')
        const cover = $(el).find('.thumb-inside .thumb img').attr('data-src')
        const preview = $(el).find('.thumb-inside .thumb img').attr('data-pvv')
        const uploader = isChannel ? $(el).find('.uploader a .name').text().trim() : null
        const uploaderUrl = isChannel ? $(el).find('.uploader a').attr('href') : null

        const metaEl = $(el).find('.thumb-under p.metadata')
        const views = metaEl.find('span.right').contents().filter((_, n) => n.type === 'text').text().trim()
        const rating = metaEl.find('span.superfluous').first().text().trim()
        const duration = metaEl.contents().filter((_, n) => n.type === 'text').map((_, n) => $(n).text().trim()).get().filter(Boolean).join('').trim()
        const resolution = metaEl.find('span.video-hd').contents().filter((_, n) => n.type === 'text').map((_, n) => $(n).text().trim()).get().filter(Boolean).join('').trim()

        if (title) {
          if (url) {
            results.push({
              id,
              eid,
              title,
              channel: isChannel ? {
                name: uploader,
                url: uploaderUrl ? `https://www.xnxx.com${uploaderUrl}` : null,
              } : null,
              duration,
              views,
              rating,
              resolution,
              thumbnail: {
                cover: cover ? cover : null,
                preview: preview ? preview : null,
              },
              url: `https://www.xnxx.com${url}`
            })
          }
        }
      })

      const totalResults = (() => {
        const plate = $('span.free-plate').attr('title')
        const txt = plate ? plate : ''
        const match = txt.match(/([\d,]+)/)
        return match ? parseInt(match[1].replace(/,/g, '')) : null
      })()

      const lastPageEl = $('div.pagination ul li a.last-page').first()
      const totalPages = lastPageEl.length ? parseInt(lastPageEl.text().trim()) : null

      return {
        page: parseInt(page),
        totalResults,
        totalPages,
        results,
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async detail(url) {
    try {
      if (!url.includes('www.xnxx.com')) throw new Error('Invalid url.')

      const { data } = await axios.get(`${this.proxy}${url}`)
      const $ = cheerio.load(data)

      let script1 = $('#video-player-bg > script:nth-child(6)').html()
      let script2 = $('script:contains("html5player.setVideoUrlLow")').html()
      let scriptContent = ''
      if (script1) {
        scriptContent = script1
      } else if (script2) {
        scriptContent = script2
      }

      const ex = (regex) => {
        const m = scriptContent.match(regex)
        if (m) {
          if (m[1]) return m[1]
        }
        return null
      }

      const confMatch = data.match(/window\.xv\.conf\s*=\s*(\{.+?\});\s*<\/script>/s)
      let conf = {}
      if (confMatch) {
        try {
          conf = JSON.parse(confMatch[1])
        } catch {}
      }
      const videoData = conf?.data ? conf.data : {}

      const metaEl = $('#video-content-metadata')
      const metaText = metaEl.find('.clear-infobar .metadata').text()
      
      const durationMatch = metaText.match(/(\d+(?:h\s*)?\d*\s*min(?:\s*\d+\s*sec)?|\d+\s*sec)/i)
      const durationRaw = durationMatch ? durationMatch[1].trim() : null

      const resMatch = metaText.match(/(\d{3,4}p)/i)
      const resolutionRaw = resMatch ? resMatch[1] : null

      const viewsMatch1 = metaText.match(/(\d[\d,\.]+(?:[kMB])?)\s*(?:views)?$/i)
      const viewsMatch2 = metaText.match(/([\d,]+(?:\.\d+)?[kMB]?)\s*$/)
      let viewsRaw = null
      if (viewsMatch1) {
        viewsRaw = viewsMatch1[1].trim()
      } else if (viewsMatch2) {
        viewsRaw = viewsMatch2[1].trim()
      }

      const rating = metaEl.find('#video-votes .rating-box').text().trim() || null
      const votesGood = metaEl.find('.vote-action-good .value').text().trim() || null
      const votesBad = metaEl.find('.vote-action-bad .value').text().trim() || null
      const description = metaEl.find('.video-description').text().trim() || null

      const tags = []
      metaEl.find('.video-tags a.is-keyword').each((_, el) => tags.push($(el).text().trim()))

      let uploaderName = videoData.uploader
      if (!uploaderName) {
        uploaderName = ex(/html5player\.setUploaderName\('(.*?)'\);/)
      }

      let uploaderUrl = null
      if (videoData.uploader_url) {
        uploaderUrl = `https://www.xnxx.com${videoData.uploader_url}`
      }

      const uploadDate = $('script[type="application/ld+json"]').first().html()
      let uploadDateParsed = null
      let durationISO = null
      if (uploadDate) {
        try {
          const ld = JSON.parse(uploadDate)
          uploadDateParsed = ld.uploadDate ? ld.uploadDate : null
          durationISO = ld.duration ? ld.duration : null
        } catch {}
      }

      const low = ex(/html5player\.setVideoUrlLow\('(.*?)'\);/)
      const high = ex(/html5player\.setVideoUrlHigh\('(.*?)'\);/)
      const HLS = ex(/html5player\.setVideoHLS\('(.*?)'\);/)

      let thumb1 = ex(/html5player\.setThumbUrl169\('(.*?)'\);/)
      let thumb2 = ex(/html5player\.setThumbUrl\('(.*?)'\);/)
      let finalThumb = null
      if (thumb1) {
        finalThumb = thumb1
      } else if (thumb2) {
        finalThumb = thumb2
      }

      let ogTitle = $('meta[property="og:title"]').attr('content')
      let fallbackTitle = ex(/html5player\.setVideoTitle\('(.*?)'\);/)
      let videoTitle = 'XNXX Video'
      if (fallbackTitle) {
        videoTitle = fallbackTitle
      } else if (ogTitle) {
        videoTitle = ogTitle
      }

      return {
        id: String(videoData.id_video ? videoData.id_video : ''),
        title: videoTitle,
        uploader: {
          name: uploaderName ? uploaderName : null,
          url: uploaderUrl,
        },
        description,
        duration: durationRaw ? durationRaw : (durationISO ? durationISO : null),
        views: viewsRaw ? viewsRaw : null,
        resolution: resolutionRaw ? resolutionRaw : null,
        rating,
        votes: { good: votesGood, bad: votesBad },
        uploadDate: uploadDateParsed,
        tags,
        thumbnail: finalThumb,
        videos: {
          low: low ? low : null,
          high: high ? high : null,
          hls: HLS ? HLS : null
        }
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }
}

const xnxx = new Xnxx()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} genshin impact`

  if (text.startsWith('get|')) {
    const parts = text.split('|')
    const videoUrl = parts[1] ? parts[1].trim() : ''

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

    const detail = await xnxx.detail(videoUrl)
    
    let videoLink = null
    if (detail.videos?.high) {
      videoLink = detail.videos.high
    } else if (detail.videos?.low) {
      videoLink = detail.videos.low
    } else if (detail.videos?.hls) {
      videoLink = detail.videos.hls
    }

    if (!videoLink) throw 'Gagal mengambil tautan unduhan video'

    return await conn.sendMessage(m.chat, {
      video: { url: videoLink },
      caption: '```Result from:```' + ` \`${detail.title}\``
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

  const searchResult = await xnxx.search(text)
  if (!searchResult) throw 'Video tidak ditemukan'
  if (!searchResult.results) throw 'Video tidak ditemukan'
  if (searchResult.results.length === 0) throw 'Video tidak ditemukan'

  const hasil = searchResult.results
  const caption = `❀ Hasil pencarian: ${text}\nTotal: ${hasil.length} video`

  const btn = new Button(conn)
    .setBody(caption)
    .setFooter('XNXX Downloader')

  if (hasil[0]?.url) {
    try {
      const detailFirst = await xnxx.detail(hasil[0].url)
      if (detailFirst?.thumbnail) {
        btn.setImage(detailFirst.thumbnail)
      }
    } catch {}
  }

  btn.addSelection('❀ Pilih Video')
  btn.makeSection('Daftar Video')

  hasil.forEach(v => {
    let dur = v.duration ? v.duration : ''
    let res = v.resolution ? v.resolution : ''
    let desc = `${dur} | ${res}`.trim()
    if (!desc) {
      desc = 'Tap untuk download'
    }

    btn.makeRow(
      '🎬',
      v.title.slice(0, 60),
      desc,
      `${usedPrefix + command} get|${v.url}`
    )
  })

  return await btn.send(m.chat, { quoted: m })
}

handler.help = ['xnxx']
handler.tags = ['nsfw']
handler.command = /^xnxx$/i
handler.premium = true

export default handler