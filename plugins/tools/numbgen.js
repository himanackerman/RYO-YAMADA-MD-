/*
 Fitur : Luban SMS ( Virtual Number Free)
 Type : Plugins ESM 
 Source : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 Source Scrape : https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/390
 */
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let [negara, nomor] = text.split('|').map(v => v?.trim())

  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} russia\n${usedPrefix + command} russia|79654138229`)
  }

  const headers = {
    'user-agent': 'NB Android/1.0.0',
    'accept-encoding': 'gzip',
    system: 'Android',
    time: `${Date.now()}`,
    type: '2'
  }

  const atom = (text) => {
    const map = {
      minute: 1, minutes: 1,
      hour: 60, hours: 60,
      day: 1440, days: 1440,
      week: 10080, weeks: 10080
    }
    const [val, unit] = text.split(' ')
    return parseInt(val) * (map[unit] || 999999)
  }

  if (negara && !nomor) {
    try {
      const res = await axios.get(`https://lubansms.com/v2/api/freeCountries?language=en`, { headers })
      const country = res.data?.msg?.find(c => c.name.toLowerCase() === negara.toLowerCase())

      if (!country) throw `Negara ${negara} tidak ditemukan`
      if (!country.online) throw `Negara ${negara} sedang offline`

      const result = await axios.get(`https://lubansms.com/v2/api/freeNumbers?countries=${negara}`, { headers })
      const list = result.data?.msg?.filter(n => !n.is_archive) || []

      if (!list.length) throw `Gagal ambil nomor`

      const sorted = list.sort((a, b) => atom(a.data_humans) - atom(b.data_humans))
      const top = sorted.slice(0, 5)

      let rows = top.map(n => ({
        title: n.full_number,
        description: n.data_humans,
        id: `${usedPrefix + command} ${negara}|${n.full_number}`
      }))

      await conn.sendMessage(m.chat, {
        text: `LUBAN NUMBERS\nNegara: ${negara.toUpperCase()}\nTotal: ${list.length}`,

        footer: 'Ryo Yamada MD',

        nativeFlow: [
          {
            text: 'Pilih Nomor',
            sections: [
              {
                title: 'Daftar Nomor',
                rows
              }
            ]
          }
        ]

      }, { quoted: m })

    } catch (e) {
      m.reply(typeof e === 'string' ? e : 'Gagal ambil nomor')
    }
  }

  if (negara && nomor) {
    try {
      nomor = nomor.replace(/\D/g, '')
      const url = `https://lubansms.com/v2/api/freeMessage?countries=${negara}&number=${nomor}`
      const { data } = await axios.get(url, { headers })

      if (data.code !== 0 || !Array.isArray(data.msg)) throw 'Belum ada pesan'

      const pesan = data.msg
        .map(m => `Dari: ${m.in_number || '-'}\nTeks: ${m.text}\n${m.data_humans}`)
        .join('\n\n')

      m.reply(`Pesan untuk ${nomor} (${negara.toUpperCase()})\n\n${pesan}`)
    } catch (e) {
      m.reply(typeof e === 'string' ? e : 'Gagal cek pesan')
    }
  }
}

handler.help = ['numbgen']
handler.tags = ['tools']
handler.command = /^numbgen$/i
handler.limit = false
handler.premium = true

export default handler