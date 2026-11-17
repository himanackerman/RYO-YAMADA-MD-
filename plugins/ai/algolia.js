import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
  const input = text?.trim()

  if (!input) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik pertanyaan atau pencarian dokumen:\n` +
      `*${usedPrefix + command} <pertanyaan>*\n\n` +
      `*Contoh:* ${usedPrefix + command} cara integrasi Algolia DocSearch`
    )
  }

  await m.react('🔍')

  try {
    const { data } = await axios.get(`${global.APIs.xrina}/ai/algolia`, {
      params: { text: input },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!data?.status || !data?.data?.answer) {
      throw new Error(data?.message || 'Gagal mendapatkan respon dari Algolia AI.')
    }

    let replyText = data.data.answer

    if (Array.isArray(data.data.suggestions) && data.data.suggestions.length > 0) {
      replyText += '\n\n💡 *Saran Pertanyaan:*\n' + data.data.suggestions.map(s => `• ${s}`).join('\n')
    }

    await m.reply(replyText.trim())
    await m.react('✨')
  } catch (e) {
    console.error('[AI Algolia Error]:', e)
    await m.react('❌')
    throw e.response?.data?.message || e.message || 'Terjadi kesalahan saat menghubungi Algolia AI.'
  }
}

handler.help = ['algolia <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(algolia|docsearch)$/i
handler.limit = true

export default handler
