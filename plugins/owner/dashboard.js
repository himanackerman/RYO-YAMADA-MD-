let handler = async (m, { conn, usedPrefix }) => {
  let stats = global.db.data.stats || {}
  
  let sorted = Object.entries(stats).sort((a, b) => b[1] - a[1])
  
  if (sorted.length === 0) {
    return m.reply('📊 Belum ada data statistik penggunaan command yang tercatat.')
  }

  let totalHits = sorted.reduce((acc, curr) => acc + curr[1], 0)
  let top10 = sorted.slice(0, 10)

  let caption = `📊 DASHBOARD STATISTIK COMMAND\n`
  caption += `📈 Total Penggunaan: ${totalHits} kali\n\n`

  top10.forEach(([cmd, count], index) => {
    let percentage = ((count / totalHits) * 100).toFixed(1)
    caption += `${index + 1}. ${usedPrefix}${cmd}\n`
    caption += `   └ Digunakan: ${count}x (${percentage}%)\n`
  })

  await m.reply(caption.trim())
}

handler.help = ['dashboard', 'topcmd']
handler.tags = ['main', 'owner']
handler.command = /^(dashboard|topcmd|dash|cmdstats)$/i

export default handler