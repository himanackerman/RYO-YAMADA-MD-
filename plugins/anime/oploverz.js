/**
 * oploverz
 * -----------------------------
 * Type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * API : https://www.puruboy.kozow.com/
 */
 
import axios from 'axios'

const API = 'https://www.puruboy.kozow.com/api/anime/oploverz'

async function apiFetch(url) {
  const { data } = await axios.get(url, { timeout: 30000 })
  return data
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh:\n${usedPrefix + command} one piece`

  if (text.includes('|')) {
    const [action, param] = text.split('|').map(v => v.trim())

    if (action === 'detail') {
      const data = await apiFetch(param)

      if (!data?.success || !data?.result?.episodes?.length) throw 'Detail tidak ditemukan'

      const anime = data.result
      const info = anime.information || {}

      const rows = anime.episodes.slice(0, 40).map(ep => ({
        title: ep.quality,
        description: ep.release_date ? `❀ ${ep.release_date}` : 'Tap untuk nonton/download',
        id: `${usedPrefix + command} stream|${ep.link}`
      }))

      return await conn.sendMessage(m.chat, {
        image: { url: anime.poster },
        caption: `❀ ${anime.title}\n` +
          `Status: ${info.status || '-'}\n` +
          `Studio: ${info.studio || '-'}\n` +
          `Genre: ${(info.genres || []).join(', ') || '-'}\n\n` +
          `${anime.description || ''}`,
        footer: 'Oploverz',
        nativeFlow: [{
          text: '❀ Pilih Episode',
          sections: [{
            title: 'Daftar Episode',
            rows
          }]
        }]
      }, { quoted: m })
    }

    if (action === 'stream') {
      const data = await apiFetch(param)

      if (!data?.success || !data?.result) throw 'Episode tidak ditemukan'

      const ep = data.result

      const streamText = (ep.stream_links || [])
        .map((s, i) => `${i + 1}. ${s.source}\n${s.url}`)
        .join('\n\n')

      const mp4List = ep.download_links?.mp4 || []
      const dlText = mp4List.map((q, i) => {
        const links = q.links.map(l => `   • ${l.host}: ${l.url}`).join('\n')
        return `*${q.quality}*\n${links}`
      }).join('\n\n')

      const caption = `❀ Episode ${ep.episode_info?.episode_number ?? '-'}\n\n` +
        (streamText ? `*Server Nonton:*\n${streamText}` : '') +
        (dlText ? `\n\n*Link Download:*\n${dlText}` : '')

      return await conn.sendMessage(m.chat, {
        text: caption
      }, { quoted: m })
    }

    throw 'Aksi tidak dikenali'
  }

  const data = await apiFetch(`${API}/search?q=${encodeURIComponent(text)}`)

  if (!data?.success || !data?.result?.length) throw 'Judul tidak ditemukan'

  const hasil = data.result

  const rows = hasil.slice(0, 20).map(v => ({
    title: v.title,
    description: `${v.type || '-'}${v.status ? ' | ' + v.status : ''}${v.score ? ' | ⭐ ' + v.score : ''}`,
    id: `${usedPrefix + command} detail|${v.link}`
  }))

  return await conn.sendMessage(m.chat, {
    image: { url: hasil[0].poster },
    caption: `❀ Hasil pencarian: ${text}\nTotal: ${hasil.length} hasil`,
    footer: 'Oploverz',
    nativeFlow: [{
      text: '❀ Pilih Judul',
      sections: [{
        title: 'Daftar Hasil',
        rows
      }]
    }]
  }, { quoted: m })
}

handler.help = ['oploverz']
handler.tags = ['anime']
handler.command = /^oploverz$/i
handler.limit = true
handler.register = true

export default handler