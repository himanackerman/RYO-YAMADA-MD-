import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = text?.trim()

  if (!input) {
    return m.reply(
      `Halo! Aku Clara 🥰\n\n` +
      `*Contoh:* ${usedPrefix + command} halo Clara, hari ini aku capek banget`
    )
  }

  await m.react('💬')

  try {
    const { data } = await axios.get(`${global.APIs.xrina}/ai/clara`, {
      params: { text: input },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!data?.status || !data?.data?.response) {
      throw new Error(data?.message || 'Gagal mendapatkan respon dari Clara.')
    }

    await m.reply(data.data.response)
    await m.react('✨')
  } catch (e) {
    console.error('[AI Clara Error]:', e)
    await m.react('❌')
    throw e.response?.data?.message || e.message || 'Terjadi kesalahan saat mengobrol dengan Clara.'
  }
}

handler.help = ['clara <teks>']
handler.tags = ['ai']
handler.command = /^(clara)$/i
handler.limit = true

export default handler
