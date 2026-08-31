import fetch from 'node-fetch'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} nature`

  let res
  if (command == 'wallsearch') {
    res = await searchWallpaper(text)
  } else if (command == 'wallrating') {
    const allowed = ['new', 'popular', 'top_rated']
    if (!allowed.includes(text)) throw `Gunakan:\n${usedPrefix + command} new\n${usedPrefix + command} popular\n${usedPrefix + command} top_rated`
    res = await searchRating(text)
  } else if (command == 'wallcat') {
    const allowed = ['video', 'parallax', 'ai_art', 'exclusive']
    if (!allowed.includes(text)) throw `Gunakan:\n${usedPrefix + command} video\n${usedPrefix + command} parallax\n${usedPrefix + command} ai_art\n${usedPrefix + command} exclusive`
    res = await searchCategory(text)
  }

  if (!res || res.length === 0) throw '❌ Tidak ditemukan wallpaper'

  let wallpapers = res.slice(0, 5).map(v => ({
    image: v.urls.original,
    caption: `🖼️ ID: ${v.id || '-'}\n👤 Author: ${v.author || '-'}\n⭐ Rating: ${v.rating || '-'}\n⬇️ Downloads: ${v.downloads || '-'}\n❤️ Favorites: ${v.favorites || '-'}`
  }))

  for (let wp of wallpapers) {
    if (!wp.image) continue
    try {
      await conn.sendMessage(m.chat, {
        image: { url: wp.image },
        caption: wp.caption
      }, { quoted: m })
    } catch (err) {
      console.error('Gagal kirim wallpaper:', err)
    }
  }
}
handler.help = ['wallsearch <query>', 'wallrating <new|popular|top_rated>', 'wallcat <video|parallax|ai_art|exclusive>']
handler.tags = ['internet']
handler.command = /^wall(search|rating|cat)$/i
handler.limit = true
export default handler

// --- Fungsi scrape ---
async function searchWallpaper(query) {
  const url = `https://api-uc.wallpaperscraft.com/images?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&lang=en&limit=60&types%5B%5D=free&types%5B%5D=private&offset=0&query=${encodeURIComponent(query)}&cost_variant=android_cost_1&sort=rating&uploader_types%5B%5D=wlc&uploader_types%5B%5D=user&uploader_types%5B%5D=wlc_ai_art`
  const headers = {
    'User-Agent': 'wallpaperscraft-android/3.56.0',
    'X-APP-VERSION': 'Android-35600',
    'X-AppCheck-Token': ''
  }
  let res = await fetch(url, { headers })
  let json = await res.json()
  return json.items?.map(item => ({
    id: item.id,
    author: item.author,
    rating: item.rating,
    downloads: item.downloads,
    favorites: item.favorites,
    urls: {
      original: item.variations?.original?.url
    }
  })) || []
}

async function searchRating(type) {
  const types = {
    'new': 'new_users_x',
    'popular': 'popular_x',
    'top_rated': 'total_x'
  }
  const url = `https://users-data-api.wallpaperscraft.com/rating?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&rating_type=${types[type]}`
  const headers = {
    'User-Agent': 'wallpaperscraft-android/3.56.0',
    'Authorization': 'Bearer null',
    'X-APP-VERSION': 'Android-35600',
    'X-AppCheck-Token': ''
  }
  let res = await fetch(url, { headers })
  let json = await res.json()
  return json.items?.map(item => ({
    id: item.id,
    author: item.author,
    rating: item.rating,
    downloads: item.downloads,
    favorites: item.favorites,
    urls: {
      original: item.variations?.original?.url
    }
  })) || []
}

async function searchCategory(category) {
  const urls = {
    video: 'https://api-uc.wallpaperscraft.com/live-images?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&lang=en&sort=rating&offset=0&limit=10&age=21&content_type=android_video&cost_variant=android_cost_1',
    parallax: 'https://api-uc.wallpaperscraft.com/parallax-images?resolution=hd&sort=rating&offset=0&limit=60&age=21&cost_variant=android_cost_1',
    ai_art: 'https://api-uc.wallpaperscraft.com/images?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&lang=en&limit=60&types%5B%5D=private&offset=0&sort=rating&cost_variant=android_cost_1&age=21&uploader_types%5B%5D=wlc_ai_art',
    exclusive: 'https://api-uc.wallpaperscraft.com/images?screen%5Bwidth%5D=720&screen%5Bheight%5D=1280&lang=en&limit=60&types%5B%5D=private&offset=0&sort=rating&cost_variant=android_cost_1&age=21&uploader_types%5B%5D=wlc'
  }

  const url = urls[category]
  const headers = {
    'User-Agent': 'wallpaperscraft-android/3.56.0',
    'X-APP-VERSION': 'Android-35600',
    'X-AppCheck-Token': ''
  }

  let res = await fetch(url, { headers })
  let json = await res.json()

  return json.items?.map(item => ({
    id: item.id,
    author: item.author,
    rating: item.rating,
    downloads: item.downloads,
    favorites: item.favorites,
    urls: {
      original: item.variations?.original?.url
    }
  })) || []
}