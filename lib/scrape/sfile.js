import cheerio from 'cheerio'
import fetch from 'node-fetch'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive'
}

export async function sfileSearch(query, page = 1) {
  const res = await fetch(`https://sfile.co/search.php?q=${encodeURIComponent(query)}&page=${page}`, { headers })
  const $ = cheerio.load(await res.text())
  const results = []

  $('.group.px-2').each((_, el) => {
    const title = $(el).find('.min-w-0 a').text().trim()
    const link = $(el).find('a').attr('href')
    const info = $(el).find('.mt-1').text().split('•')

    if (link) {
      results.push({
        title,
        size: info[0]?.trim(),
        upload: info[1]?.trim(),
        link
      })
    }
  })

  return results
}

export async function sfileDownload(url, buffer = true) {
  const res = await fetch(url, { headers })
  const html = await res.text()
  const $ = cheerio.load(html)

  const metadata = {
    filename: $('.overflow-hidden img').attr('alt')?.trim() || 'file',
    mimetype: $('.divide-y span').first().text().trim(),
    download_count: $('.divide-y .font-semibold').eq(1).text().trim(),
    author_name: $('.divide-y a').first().text().trim()
  }

  let dl =
    $('#download').attr('data-dw-url') ||
    $('a#download').attr('href')

  if (!dl) throw new Error('Download URL tidak ditemukan')

  const cdn = await fetch(dl, {
    headers,
    redirect: 'follow'
  })

  const finalUrl = cdn.url

  if (!finalUrl) throw new Error('Redirect CDN gagal')

  if (!buffer) {
    return { metadata, download: finalUrl }
  }

  const arrayBuffer = await cdn.arrayBuffer()

  return {
    metadata,
    download: Buffer.from(arrayBuffer)
  }
}