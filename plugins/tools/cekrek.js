import axios from 'axios'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Contoh:\n${usedPrefix + command} Dana|0855xxxxx`
  }

  let [bank, number] = text.split('|')

  if (!bank || !number) {
    throw `Format salah!\n\nContoh:\n${usedPrefix + command} Dana|0855xxxx`
  }

  try {
    let { data } = await axios.get('https://api.nexray.eu.cc/information/check-rekening', {
      params: {
        number: number.trim(),
        bank: bank.trim()
      }
    })

    let result = data.result || {}

    let teks = `❏ Cek Rekening

❏ Bank : ${bank}
❏ Nomor : ${number}
❏ Status : ${result.success ? 'Valid' : 'Tidak Valid'}
❏ Pesan : ${result.error?.message || result.message || '-'}

❏ Response Time : ${data.response_time || '-'}`

    m.reply(teks)

  } catch (e) {
    console.error(e)
    m.reply('Gagal melakukan pengecekan rekening.')
  }
}

handler.help = ['cekrek <bank>|<nomor>']
handler.tags = ['tools']
handler.command = /^(cekrek|cekrekening)$/i
handler.limit = true

export default handler