/**
 * Scraper : pinterest
 * base : https://id.pinterest.com
 * creator : hilman 
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

import axios from 'axios'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Pinterest-AppState': 'active',
  'X-Pinterest-Source-Url': '/ideas/',
  'X-Pinterest-PWS-Handler': 'www/ideas.js',
  'Accept': 'application/json, text/javascript, */*, q=0.01'
}

export class PinterestScraper {
  constructor(headers = {}) {
    this.headers = { ...DEFAULT_HEADERS, ...headers }
    this.baseUrl = 'https://id.pinterest.com'
  }

  /**
   * Mencari gambar di Pinterest berdasarkan kata kunci
   * @param {string} query - Kata kunci pencarian
   * @param {Object} [options]
   * @param {string} [options.bookmark=''] - Token pagination untuk halaman berikutnya
   * @returns {Promise<{results: Array, nextBookmark: string|null}>}
   */
  async search(query, { bookmark = '' } = {}) {
    if (!query) throw new Error('Query pencarian tidak boleh kosong')

    const args = {
      options: {
        query,
        bookmarks: [bookmark]
      },
      context: {}
    }

    const url = `${this.baseUrl}/resource/BaseSearchResource/get/?data=${encodeURIComponent(JSON.stringify(args))}`
    const { data } = await axios.get(url, { headers: this.headers, timeout: 15000 })

    const rawResults = data?.resource_response?.data?.results || []
    const nextBookmark = data?.resource_response?.bookmark || null

    const results = rawResults
      .filter(item => item?.type === 'pin' && item?.images)
      .map(item => {
        const orig = item.images?.orig?.url
        const x736 = item.images?.['736x']?.url
        const x474 = item.images?.['474x']?.url
        const x236 = item.images?.['236x']?.url

        return {
          id: item.id,
          title: item.title || item.grid_title || item.auto_alt_text || item.seo_alt_text || 'Pinterest Image',
          description: item.description || '',
          image: orig || x736 || x474,
          thumb: x236 || x474 || orig,
          author: item.pinner?.full_name || item.pinner?.username || 'Unknown',
          board: item.board?.name || '',
          url: `https://www.pinterest.com/pin/${item.id}/`
        }
      })

    return { results, nextBookmark }
  }

  /**
   * Mengunduh buffer gambar atau media dari Pinterest
   * @param {string} url - URL gambar atau CDN Pinterest
   * @returns {Promise<Buffer>}
   */
  async download(url) {
    if (!url) throw new Error('URL download tidak boleh kosong')
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': this.headers['User-Agent'],
        'Referer': 'https://id.pinterest.com/'
      }
    })
    return Buffer.from(res.data)
  }
}

export const pinterest = new PinterestScraper()
export const pinterestSearch = (query, opts) => pinterest.search(query, opts)
export const pinterestDownload = (url) => pinterest.download(url)

export default pinterest
