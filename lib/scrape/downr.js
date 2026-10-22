import axios from 'axios'

class DownrScraper {
  constructor() {
    this.baseURL = 'https://downr.org'
    this.headers = {
      'authority': 'downr.org',
      'accept': '*/*',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'origin': 'https://downr.org',
      'referer': 'https://downr.org/',
      'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
      'accept-encoding': 'gzip, deflate, br, zstd'
    }
  }

  async getSessionCookie() {
    const cookies = '_ga=GA1.1.536005378.1770437315; _clck=17lj13q%5E2%5Eg3d%5E0%5E2229; _ga_2HS60D2GS7=GS2.1.s1770437315$o1$g1$t1770437481$j60$l0$h0; _clsk=1yaus0r%5E1770437888260%5E3%5E1%5Ed.clarity.ms%2Fcollect'

    const response = await axios.get(`${this.baseURL}/.netlify/functions/analytics`, {
      headers: { ...this.headers, cookie: cookies }
    })

    const setCookie = response.headers['set-cookie']?.[0]
    const sessCookie = setCookie?.split(';')[0] || ''

    return `${cookies}; ${sessCookie}`
  }

  async getVideoInfo(url) {
    const cookie = await this.getSessionCookie()

    const response = await axios.post(
      `${this.baseURL}/.netlify/functions/nyt`,
      { url },
      {
        headers: { ...this.headers, cookie }
      }
    )

    return {
      url: response.data.url,
      title: response.data.title,
      author: response.data.author,
      duration: response.data.duration,
      thumbnail: response.data.thumbnail,
      medias: response.data.medias
    }
  }
}

export default DownrScraper