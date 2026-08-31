/**
 * @project    : SaveTik.io TikTok Downloader (savetik.io)
 * @author     : Kayllano Aveline 👨‍💻
 * @license    : MIT / Personal
 * @description: Powered by AliciaCode - Web Scraping Specialist
 * Website     : xalixia.biz.id
 **/

import axios from 'axios'
import cheerio from 'cheerio'

class TikTokScraper {
  constructor() {
    this.apiUrl = 'https://savetik.io/api/ajaxSearch'

    this.headers = {
      accept: '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      origin: 'https://savetik.io',
      referer: 'https://savetik.io/en',
      'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/148.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest'
    }
  }

  /**
   * Cari video TikTok dan dapetin semua download links
   * @param {string} url
   * @returns {Promise<Object>}
   */
  async download(url) {
    try {
      const form = new URLSearchParams()
      form.append('q', url)
      form.append('cursor', '0')
      form.append('page', '0')
      form.append('lang', 'en')

      const { data } = await axios.post(
        this.apiUrl,
        form.toString(),
        {
          headers: this.headers,
          timeout: 30000
        }
      )

      if (
        data.status !== 'ok' &&
        data.status !== true
      ) {
        throw new Error('Failed to fetch video data')
      }

      if (!data?.data) {
        throw new Error('Empty response')
      }

      const $ = cheerio.load(data.data)

      const result = {
        success: true,
        video_id: $('#TikTokId').val() || null,

        title:
          $('.content h3').first().text().trim() ||
          $('title').text().trim() ||
          'TikTok Video',

        thumbnail:
          $('.image-tik img').attr('src') || null,

        links: {
          hd: null,

          sd: {
            proxied: null,
            direct: null
          },

          mp3: null
        }
      }

      $('.dl-action a.tik-button-dl').each((_, el) => {
        const text = $(el).text().trim().toLowerCase()
        const href = $(el).attr('href')

        if (!href) return

        if (text.includes('mp4 hd')) {
          result.links.hd = href
        }

        else if (text.includes('mp4')) {
          if (href.includes('snapcdn.app')) {
            result.links.sd.proxied = href
          } else {
            result.links.sd.direct = href
          }
        }

        else if (text.includes('mp3')) {
          result.links.mp3 = href
        }
      })

      return result

    } catch (e) {
      return {
        success: false,
        error: e.message
      }
    }
  }
}

export default new TikTokScraper()