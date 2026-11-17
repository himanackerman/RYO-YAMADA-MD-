import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
  const input = text?.trim()

  if (!input) {
    return m.reply(
      `*Format salah!*\n\n` +
      `Ketik pertanyaan atau tugas coding:\n` +
      `*${usedPrefix + command} <pertanyaan>*\n\n` +
      `*Contoh:* ${usedPrefix + command} buatkan fungsi javascript untuk menjumlahkan array`
    )
  }

  await m.react('💬')

  try {
    const { data } = await axios.get(`${global.APIs.xrina}/ai/blackbox-ai`, {
      params: { query: input },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!data?.status || !data?.data?.response) {
      throw new Error(data?.message || 'Gagal mendapatkan respon dari Blackbox AI.')
    }

    await m.reply(data.data.response)
    await m.react('✨')
  } catch (e) {
    console.error('[AI Blackbox Error]:', e)
    await m.react('❌')
    throw e.response?.data?.message || e.message || 'Terjadi kesalahan saat menghubungi Blackbox AI.'
  }
}

handler.help = ['blackbox <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(blackbox|blackboxai|bbai)$/i
handler.limit = true

export default handler
