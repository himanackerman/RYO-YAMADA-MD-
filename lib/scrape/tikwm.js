import axios from 'axios'

const headers = {
  'user-agent': 'Mozilla/5.0'
}

async function resolveUrl(url) {
  try {
    let res = await axios.head(url, {
      maxRedirects: 5,
      headers
    })

    return res.request?.res?.responseUrl || url

  } catch {
    return url
  }
}

export async function tiktokSearch(query) {
  try {
    const { data } = await axios.get(
      'https://www.tikwm.com/api/feed/search',
      {
        params: {
          keywords: query,
          count: 10,
          cursor: 0
        },
        headers
      }
    )

    let vids = data?.data?.videos

    if (!Array.isArray(vids) || !vids.length) {
      return []
    }

    return vids.map(v => ({
      title: v.title || 'TikTok Video',
      author: v.author?.nickname || 'Unknown',
      url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`
    }))

  } catch (e) {
    console.log('TikTok Search Error:', e)
    return []
  }
}

export async function tiktokScrape(url) {
  try {
    url = await resolveUrl(url)

    const { data } = await axios.get(
      'https://www.tikwm.com/api/',
      {
        params: {
          url,
          hd: 1
        },
        headers
      }
    )

    let r = data?.data

    if (!r) return null

    let video =
      r.hdplay ||
      r.play ||
      r.wmplay

    let images = Array.isArray(r.images)
      ? r.images
      : []

    let audio =
      r.music ||
      r.music_info?.play ||
      r.music_info?.url ||
      r.music_info?.play_url

    return {
      type: images.length ? 'image' : 'video',
      video,
      audio,
      images,
      title: r.title || 'TikTok Video',
      author: r.author?.nickname || 'Unknown'
    }

  } catch (e) {
    console.log('TikTok Scrape Error:', e)
    return null
  }
}