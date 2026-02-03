import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://api.siputzx.my.id/api/info/liburnasional')
    const json = await res.json()

    if (!json.status) throw '❌ Gagal mengambil data'

    const { hari_ini, mendatang } = json.data

    let teks = `📆 *Info Hari Ini & Libur Nasional*\n\n`

    
    teks += `🗓️ *Hari Ini (${hari_ini.tanggal})*\n`
    if (hari_ini.events.length === 0) {
      teks += `Tidak ada event atau libur hari ini.\n`
    } else {
      for (let event of hari_ini.events) {
        teks += `• ${event}\n`
      }
    }

    
    if (mendatang?.event_nasional?.length) {
      teks += `\n🇮🇩 *Event Nasional Mendatang:*\n`
      for (let i = 0; i < Math.min(5, mendatang.event_nasional.length); i++) {
        const ev = mendatang.event_nasional[i]
        teks += `• ${ev.event} (${ev.date}) - ${ev.daysUntil} hari lagi\n`
      }
    }

    
    if (mendatang?.hari_libur?.length) {
      teks += `\n🎉 *Hari Libur Mendatang:*\n`
      for (let i = 0; i < Math.min(5, mendatang.hari_libur.length); i++) {
        const ev = mendatang.hari_libur[i]
        teks += `• ${ev.event} (${ev.date}) - ${ev.daysUntil} hari lagi\n`
      }
    }

    await conn.reply(m.chat, teks.trim(), m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Terjadi kesalahan saat mengambil data libur nasional.', m)
  }
}

handler.help = ['liburnas']
handler.tags = ['info']
handler.command = /^liburnas$/i
handler.limit = false

export default handler