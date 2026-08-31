import axios from 'axios'
import cheerio from 'cheerio'
import FormData from 'form-data'
import CryptoJS from 'crypto-js'

function createTimers(resi) {
  try {
    const keyHex = '79540e250fdb16afac03e19c46dbdeb3'
    const ivHex = 'eb2bb9425e81ffa942522e4414e95bd0'
    const key = CryptoJS.enc.Hex.parse(keyHex)
    const iv = CryptoJS.enc.Hex.parse(ivHex)
    const encrypted = CryptoJS.AES.encrypt(resi, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  } catch (e) {
    return null
  }
}

async function cekresi(noresi, ekspedisi) {
  try {
    const _ekspedisi = {
      'shopee-express': 'SPX',
      'ninja': 'NINJA',
      'lion-parcel': 'LIONPARCEL',
      'pos-indonesia': 'POS',
      'tiki': 'TIKI',
      'acommerce': 'ACOMMERCE',
      'gtl-goto-logistics': 'GTL',
      'paxel': 'PAXEL',
      'sap-express': 'SAP',
      'indah-logistik-cargo': 'INDAH',
      'lazada-express-lex': 'LEX',
      'lazada-logistics': 'LEL',
      'janio-asia': 'JANIO',
      'jet-express': 'JETEXPRESS',
      'pcp-express': 'PCP',
      'pt-ncs': 'NCS',
      'nss-express': 'NSS',
      'grab-express': 'GRAB',
      'rcl-red-carpet-logistics': 'RCL',
      'qrim-express': 'QRIM',
      'ark-xpress': 'ARK',
      'standard-express-lwe': 'LWE',
      'luar-negeri-bea-cukai': 'BEACUKAI'
    }

    if (!noresi) throw new Error('Nomor resi kosong!')
    if (!Object.keys(_ekspedisi).includes(ekspedisi)) throw new Error(`Ekspedisi salah! Pilih: ${Object.keys(_ekspedisi).join(', ')}`)

    const { data: html } = await axios.get('https://cekresi.com/')
    const $ = cheerio.load(html)

    const timers = createTimers(noresi.toUpperCase().replace(/\s/g, ''))
    const form = new FormData()
    form.append('viewstate', $('input[name="viewstate"]').attr('value'))
    form.append('secret_key', $('input[name="secret_key"]').attr('value'))
    form.append('e', _ekspedisi[ekspedisi])
    form.append('noresi', noresi.toUpperCase().replace(/\s/g, ''))
    form.append('timers', timers)

    const { data } = await axios.post(
      `https://apa2.cekresi.com/cekresi/resi/initialize.php?ui=e0ad7e971ce77822056ba7a155f85c11&p=1&w=${Math.random().toString(36).substring(7)}`,
      form,
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          referer: 'https://cekresi.com/',
          origin: 'https://cekresi.com',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
      }
    )

    const $res = cheerio.load(data)
    const result = {
      success: false,
      message: '',
      data: {
        resi: noresi,
        ekspedisi: '',
        ekspedisiCode: _ekspedisi[ekspedisi],
        status: '',
        tanggalKirim: '',
        customerService: '',
        lastPosition: '',
        shareLink: '',
        history: []
      }
    }

    const alertSuccess = $res('.alert.alert-success')
    if (alertSuccess.length > 0) {
      result.success = true
      result.message = alertSuccess.text().trim()
      result.data.ekspedisi = $res('#nama_expedisi').text().trim()

      const infoTable = $res('table.table-striped tbody tr')
      infoTable.each((_, el) => {
        const cells = $res(el).find('td')
        if (cells.length >= 3) {
          const label = $res(cells[0]).text().trim()
          const value = $res(cells[2]).text().trim()
          if (label === 'Tanggal Pengiriman') result.data.tanggalKirim = value
          if (label === 'Status') result.data.status = value
        }
      })

      const lastPos = $res('#last_position').text().trim()
      if (lastPos) result.data.lastPosition = lastPos

      const shareLink = $res('#linkcekresi').attr('value')
      if (shareLink) result.data.shareLink = shareLink

      const historyTable = $res('h4:contains("History")').next('table').find('tbody tr')
      historyTable.each((_, el) => {
        const cells = $res(el).find('td')
        if (cells.length >= 2) {
          const tanggal = $res(cells[0]).text().trim()
          const ket = $res(cells[1]).text().trim()
          if (tanggal && ket) {
            result.data.history.push({ tanggal, keterangan: ket })
          }
        }
      })
    } else {
      const alertError = $res('.alert.alert-danger, .alert.alert-warning')
      result.message = alertError.length > 0 ? alertError.text().trim() : 'Tidak dapat mengambil informasi resi'
    }

    return result
  } catch (e) {
    return {
      success: false,
      message: e.message,
      data: null
    }
  }
}

// Handler Command ESM
let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  if (!text) throw `Contoh:\n${usedPrefix + command} SPXID054330680586|shopee-express`

  const [resi, ekspedisi] = text.split('|').map(v => v.trim().toLowerCase())
  if (!resi || !ekspedisi) throw `Format salah!\nContoh: ${usedPrefix + command} SPXID054330680586|shopee-express`

  const result = await cekresi(resi, ekspedisi)

  if (!result.success) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    throw result.message
  }

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  const hasil = `
📦 *Cek Resi*
• No Resi: *${result.data.resi}*
• Ekspedisi: *${result.data.ekspedisi}*
• Status: *${result.data.status}*
• Tanggal Kirim: *${result.data.tanggalKirim}*
• Posisi Terakhir: *${result.data.lastPosition}*
• History:
${result.data.history.map(h => `- ${h.tanggal}: ${h.keterangan}`).join('\n')}

🔗 *Link Cekresi:* ${result.data.shareLink}
`.trim()

  await conn.reply(m.chat, hasil, m)
}

handler.help = ['cekresi'].map(v => v + ' <no resi>|<ekspedisi>')
handler.tags = ['tools']
handler.command = /^cekresi$/i
handler.limit = true

export default handler