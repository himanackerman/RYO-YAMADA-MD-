import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
  const input = text?.trim()

  if (!input) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik pertanyaan atau perintah untuk DeepSeek:\n` +
      `*${usedPrefix + command} <pertanyaan>*\n\n` +
      `*Contoh:* ${usedPrefix + command} Jelaskan cara kerja blockchain dalam bahasa Indonesia`
    )
  }

  await m.react('💬')

  try {
    const { data } = await axios.get(`${global.APIs.xrina}/ai/deepseek`, {
      params: { text: input },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!data?.status || !data?.data?.response) {
      throw new Error(data?.message || 'Gagal mendapatkan respon dari DeepSeek AI.')
    }

    await m.reply(data.data.response)
    await m.react('✨')
  } catch (e) {
    console.error('[AI DeepSeek Error]:', e)
    await m.react('❌')
    throw e.response?.data?.message || e.message || 'Terjadi kesalahan saat menghubungi DeepSeek AI.'
  }
}

handler.help = ['deepseek <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(deepseek|r1|deepseekai)$/i
handler.limit = true

export default handler
