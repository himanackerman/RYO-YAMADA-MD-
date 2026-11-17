/**
 * Scraper : pixiv
 * base : https://www.pixiv.net
 * creator : hilman 
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

import axios from 'axios'

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Referer': 'https://www.pixiv.net/'
}

export class PixivScraper {
  constructor(headers = {}) {
    this.headers = { ...DEFAULT_HEADERS, ...headers }
  }

  /**
   * Mengambil ranking Pixiv berdasarkan mode dan tanggal
   * @param {Object} options
   * @param {string} [options.mode='daily'] - 'daily', 'weekly', 'monthly', 'rookie', 'male', 'female'
   * @param {number} [options.page=1]
   * @param {string} [options.date=''] - format 'YYYYMMDD' (opsional)
   * @param {string} [options.content=''] - 'illust', 'manga', 'ugoira' (opsional)
   */
  async ranking({ mode = 'daily', page = 1, date = '', content = '' } = {}) {
    const params = {
      format: 'json',
      mode,
      p: page
    }
    if (date) params.date = date
    if (content) params.content = content

    const { data } = await axios.get('https://www.pixiv.net/ranking.php', {
      params,
      headers: this.headers
    })

    if (!data || !data.contents) {
      throw new Error('Gagal mengambil data ranking Pixiv')
    }

    return (data.contents || []).map(item => ({
      rank: item.rank,
      yes_rank: item.yes_rank,
      id: item.illust_id,
      title: item.title,
      author: item.user_name,
      authorId: item.user_id,
      width: item.width,
      height: item.height,
      views: item.view_count,
      ratingCount: item.rating_count,
      score: item.score,
      url: `https://www.pixiv.net/artworks/${item.illust_id}`,
      thumb: item.url,
      image: item.url ? item.url.replace('/c/240x480/', '/c/600x1200_90/') : null
    }))
  }

  /**
   * Mengambil detail artwork Pixiv berdasarkan ID atau link
   * @param {string|number} idOrUrl
   */
  async detail(idOrUrl) {
    const id = String(idOrUrl).match(/\d+/)?.[0]
    if (!id) throw new Error('ID Artwork tidak valid')

    const { data } = await axios.get(`https://www.pixiv.net/ajax/illust/${id}`, {
      headers: this.headers
    })

    if (data.error) {
      throw new Error(data.message || 'Artwork tidak ditemukan atau bersifat privat')
    }

    const b = data.body
    return {
      id: b.id,
      title: b.title,
      description: (b.description || '').replace(/<[^>]+>/g, ' ').trim(),
      author: b.userName,
      authorId: b.userId,
      tags: (b.tags?.tags || []).map(t => t.tag),
      views: b.viewCount,
      bookmarks: b.bookmarkCount,
      likes: b.likeCount,
      pageCount: b.pageCount,
      urls: {
        thumb: b.urls?.thumb,
        small: b.urls?.small,
        regular: b.urls?.regular,
        original: b.urls?.original
      },
      createDate: b.createDate,
      uploadDate: b.uploadDate,
      url: `https://www.pixiv.net/artworks/${b.id}`
    }
  }

  /**
   * Mengambil semua halaman gambar dari artwork (multi-page/manga set)
   * @param {string|number} idOrUrl
   */
  async pages(idOrUrl) {
    const id = String(idOrUrl).match(/\d+/)?.[0]
    if (!id) throw new Error('ID Artwork tidak valid')

    const { data } = await axios.get(`https://www.pixiv.net/ajax/illust/${id}/pages`, {
      headers: this.headers
    })

    if (data.error) {
      throw new Error(data.message || 'Gagal mengambil halaman artwork')
    }

    return (data.body || []).map(p => ({
      urls: p.urls,
      width: p.width,
      height: p.height
    }))
  }

  /**
   * Mencari artwork di Pixiv berdasarkan kata kunci
   * @param {string} query
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {string} [options.order='date_d'] - 'date_d' (terbaru) atau 'popular_d' (jika premium)
   */
  async search(query, { page = 1, order = 'date_d', mode = 'all' } = {}) {
    if (!query) throw new Error('Query pencarian tidak boleh kosong')

    const { data } = await axios.get(`https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(query)}`, {
      params: {
        word: query,
        order,
        mode,
        p: page,
        s_mode: 's_tag_full',
        type: 'all',
        lang: 'en'
      },
      headers: this.headers
    })

    const items = data.body?.illustManga?.data || []
    return items
      .filter(i => i.id)
      .map(i => ({
        id: i.id,
        title: i.title,
        author: i.userName,
        authorId: i.userId,
        tags: i.tags || [],
        pageCount: i.pageCount,
        thumb: i.url,
        url: `https://www.pixiv.net/artworks/${i.id}`
      }))
  }

  /**
   * Download file gambar dari Pixiv CDN dengan bypass Referer
   * @param {string} url
   * @returns {Promise<Buffer>}
   */
  async download(url) {
    if (!url) throw new Error('URL download tidak boleh kosong')
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: this.headers
    })
    return Buffer.from(res.data)
  }
}

export const pixiv = new PixivScraper()
export const pixivRanking = (opts) => pixiv.ranking(opts)
export const pixivDetail = (id) => pixiv.detail(id)
export const pixivPages = (id) => pixiv.pages(id)
export const pixivSearch = (q, opts) => pixiv.search(q, opts)
export const pixivDownload = (url) => pixiv.download(url)

export default pixiv
