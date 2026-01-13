import { cpus as _cpus, totalmem, freemem, arch, platform, release, hostname, networkInterfaces } from 'os'
import { performance } from 'perf_hooks'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

function getNetworkInfo() {
  const interfaces = networkInterfaces()
  for (const [name, nets] of Object.entries(interfaces)) {
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        return `📡 ${name}: ${net.address}`
      }
    }
  }
  return 'No network connection'
}

function calculateCoreUsage(cpus) {
  return cpus.map((cpu, index) => {
    const total = Object.keys(cpu.times).reduce((sum, type) => sum + cpu.times[type], 0)
    const usage = 100 - (cpu.times.idle / total * 100)
    return {
      core: index + 1,
      usage: usage.toFixed(1),
      model: cpu.model.split('@')[0].trim()
    }
  })
}

var handler = async (m, { conn }) => {
  let old = performance.now()
  let neww = performance.now()
  let ping = Math.round(neww - old)
  const used = process.memoryUsage()
  const cpus = _cpus()
  const totalMemory = totalmem()
  const freeMemory = freemem()
  const usedMemory = totalMemory - freeMemory
  const memoryUsage = (usedMemory / totalMemory * 100).toFixed(1)

  let overallCpuUsage = '0'
  let coreUsages = []
  
  try {
    const osu = await import('node-os-utils')
    overallCpuUsage = (await osu.cpu.usage()).toFixed(1)
    coreUsages = calculateCoreUsage(cpus)
  } catch (e) {
    coreUsages = calculateCoreUsage(cpus)
    overallCpuUsage = coreUsages.length > 0 
      ? (coreUsages.reduce((sum, core) => sum + parseFloat(core.usage), 0) / coreUsages.length).toFixed(1)
      : '0'
  }

  let coreDisplay = coreUsages.map(core => 
    `▸ Core ${core.core}: ${core.usage}%`
  ).join('\n')

  if (coreUsages.length > 8) {
    coreDisplay = coreUsages.slice(0, 8).map(core => 
      `▸ Core ${core.core}: ${core.usage}%`
    ).join('\n') + 
    `\n▸ ... and ${coreUsages.length - 8} more cores` +
    `\n▸ Avg Usage: ${overallCpuUsage}%`
  }

  let maxim = `
🏓 *PING PERFORMANCE*
• Response Time: ${ping} ms
• Status: ${getPingStatus(ping)}

🖥️ *SYSTEM INFO*
• Host: ${hostname()}
• Platform: ${platform()} ${arch()}
• OS: ${release()}

💾 *MEMORY USAGE*
• Total: ${format(totalMemory)}
• Used: ${format(usedMemory)} (${memoryUsage}%)
• Free: ${format(freeMemory)}

⚡ *CPU STATUS*
• Model: ${cpus[0]?.model.split('@')[0].trim() || 'Unknown'}
• Cores: ${cpus.length}
• Usage: ${overallCpuUsage}%

📊 *PER CORE USAGE*
${coreDisplay}

${getNetworkInfo()}

🕐 *BOT STATUS*
• Uptime: ${clockString(process.uptime() * 1000)}
• Performance: ${getPerformanceStatus(ping, parseFloat(overallCpuUsage), memoryUsage)}
  `

  m.reply(maxim)
}

function getPingStatus(ping) {
  if (ping < 50) return '🟢 Excellent'
  if (ping < 100) return '🟡 Good'
  if (ping < 200) return '🟠 Average'
  return '🔴 Poor'
}

function getPerformanceStatus(ping, cpuUsage, memoryUsage) {
  if (ping < 100 && cpuUsage < 80 && memoryUsage < 80) return '🟢 Optimal'
  if (ping < 200 && cpuUsage < 90 && memoryUsage < 90) return '🟡 Stable'
  return '🔴 Needs Attention'
}

function clockString(ms) {
  if (isNaN(ms)) return '--'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d > 0 ? `${d}d` : '', h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : '', `${s}s`].filter(Boolean).join(' ')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler