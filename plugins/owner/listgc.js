import moment from 'moment-timezone'

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('Owner only!')

  try {
    const groups = Object.values(await conn.groupFetchAllParticipating())
    if (!groups.length) return m.reply('❌ Bot belum gabung di grup manapun.')

    let teks = `⬣ *LIST GROUP*\n`
    teks += `📊 Total Grup: ${groups.length}\n\n`

    const buttons = []

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i]
      const created = moment(g.creation * 1000)
        .tz('Asia/Jakarta')
        .format('DD/MM/YYYY HH:mm') + ' WIB'

      teks += `*${i + 1}. ${g.subject}*\n`
      teks += `🆔 ID: ${g.id}\n`
      teks += `👥 Member: ${g.participants?.length || 0}\n`
      teks += `🕐 Dibuat: ${created}\n\n`

      buttons.push({
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
          display_text: `📋 Copy ID GC #${i + 1}`,
          copy_code: g.id
        })
      })
    }

    await conn.sendMessage(m.chat, {
      text: teks,
      footer: '📌 Klik tombol untuk menyalin ID grup',
      interactiveButtons: buttons
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil data grup.')
  }
}

handler.help = ['listgc']
handler.tags = ['owner']
handler.command = /^listgc$/i
handler.owner = true

export default handler