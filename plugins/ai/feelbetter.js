import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
  const input = text?.trim()

  if (!input) {
    return m.reply(
      `Hai! Lagi merasa kurang baik atau ingin curhat?\n\n` +
      `*Contoh:* ${usedPrefix + command} halo, hari ini aku capek dan stres banget`
    )
  }

  await m.react('💚')

  try {
    const { data } = await axios.get(`${global.APIs.xrina}/ai/feelbetter`, {
      params: { text: input },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 60000
    })

    if (!data?.status || !data?.data?.response) {
      throw new Error(data?.message || 'Gagal mendapatkan respon dari FeelBetter AI.')
    }

    await m.reply(data.data.response)
    await m.react('✨')
  } catch (e) {
    console.error('[AI FeelBetter Error]:', e)
    await m.react('❌')
    throw e.response?.data?.message || e.message || 'Terjadi kesalahan saat mengobrol dengan FeelBetter AI.'
  }
}

handler.help = ['feelbetter <curhat/pesan>']
handler.tags = ['ai']
handler.command = /^(feelbetter|curhat|mentalhealth)$/i
handler.limit = true

export default handler
