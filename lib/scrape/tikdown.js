/**
 * Scraper : Tikdown
 * base : https://tikdown.com
 * creator : hilman 
 * channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 */

export async function tikdown(url) {
  const baseUrl = 'https://tikdown.com'

  const pageRes = await fetch(`${baseUrl}/id/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  })

  if (!pageRes.ok) throw new Error(`Gagal membuka halaman: ${pageRes.status}`)

  const html = await pageRes.text()
  const cookie = (pageRes.headers.get('set-cookie') || '').split(';')[0] || ''
  const csrfToken = html.match(/name=["']csrfToken["'][^>]*value=["']([^"']+)["']/i)?.[1]

  if (!csrfToken) throw new Error('CSRF Token tidak ditemukan')

  const form = new FormData()
  form.append('url', url)
  form.append('csrfToken', csrfToken)

  const apiRes = await fetch(`${baseUrl}/api/extract.php`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Origin': baseUrl,
      'Referer': `${baseUrl}/id/`,
      ...(cookie ? { 'Cookie': cookie } : {})
    },
    body: form
  })

  if (!apiRes.ok) throw new Error(`API Error: ${apiRes.status}`)

  const json = await apiRes.json()
  if (!json.ok || !json.result) throw new Error(json.message || 'Gagal memproses data TikTok.')

  const { result } = json
  const items = result.mediaItems || []

  const images = items.filter(i => i.type === 'image' || i.extension === 'webp' || i.extension === 'jpg' || i.extension === 'jpeg')
  const videos = items.filter(i => i.type === 'video')
  const audios = items.filter(i => i.type === 'audio')

  return {
    isSlide: images.length > 0,
    type: images.length > 0 ? 'image' : 'video',
    id: result.id,
    title: result.description || result.title,
    thumbnail: result.thumbnail,
    user: {
      name: result.user?.name,
      username: result.user?.username,
      avatar: result.user?.avatar
    },
    author: result.user?.username || result.user?.name || '-',
    images: images.map(i => i.previewUrl || i.v5Url || i.url),
    video: {
      fhd: videos.find(v => v.quality === 'FHD')?.previewUrl || videos.find(v => v.quality === 'FHD')?.v5Url,
      hd: videos.find(v => v.quality === 'HD')?.previewUrl || videos.find(v => v.quality === 'HD')?.v5Url,
      sd: videos.find(v => v.quality === 'SD')?.previewUrl || videos.find(v => v.quality === 'SD')?.v5Url,
      default: videos[0]?.previewUrl || videos[0]?.v5Url
    },
    videoUrl: videos.find(v => v.quality === 'FHD')?.previewUrl ||
      videos.find(v => v.quality === 'FHD')?.v5Url ||
      videos.find(v => v.quality === 'HD')?.previewUrl ||
      videos.find(v => v.quality === 'HD')?.v5Url ||
      videos.find(v => v.quality === 'SD')?.previewUrl ||
      videos.find(v => v.quality === 'SD')?.v5Url ||
      videos[0]?.previewUrl ||
      videos[0]?.v5Url ||
      videos[0]?.url || null,
    audio: audios[0]?.previewUrl || audios[0]?.v5Url || audios[0]?.url
  }
}

export default tikdown
