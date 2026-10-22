let handler = m => m

handler.all = async function (m) {
  if (!m.text) return
  if (m.isBaileys) return

  let prefixes = ['.', '#', '!', '/']
  let prefix = prefixes.find(p => m.text.startsWith(p))
  
  if (!prefix) return

  let args = m.text.slice(prefix.length).trim().split(/ +/)
  let command = args.shift().toLowerCase()

  if (!command) return

  global.db.data.stats = global.db.data.stats || {}
  global.db.data.stats[command] = (global.db.data.stats[command] || 0) + 1
}

export default handler