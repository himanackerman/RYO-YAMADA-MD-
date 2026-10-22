/*
fitur : to esm to cjs 
creator : hilman
follow my channel https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
*/

let handler = async (m, { command }) => {
  if (!m.quoted) return m.reply('✨ reply code nya')

  let q = m.quoted
  let text =
    q.text ||
    q.caption ||
    q.msg?.text ||
    q.msg?.caption ||
    q.msg?.conversation ||
    q.msg?.extendedTextMessage?.text ||
    q.message?.conversation ||
    q.message?.extendedTextMessage?.text ||
    ''

  let input = text.trim()
  let output = ''

  if (command === 'toesm') {
    output = input
      .replace(/const (.*?) = require\(['"](.*?)['"]\)/g, 'import $1 from "$2"')
      .replace(/let (.*?) = require\(['"](.*?)['"]\)/g, 'import $1 from "$2"')
      .replace(/var (.*?) = require\(['"](.*?)['"]\)/g, 'import $1 from "$2"')
      .replace(/module\.exports\s*=\s*/g, 'export default ')
      .replace(/exports\.(\w+)\s*=\s*/g, 'export const $1 = ')
  }

  if (command === 'tocjs') {
    output = input
      .replace(/import\s+(.*?)\s+from\s+['"](.*?)['"]/g, 'const $1 = require("$2")')
      .replace(/export default /g, 'module.exports = ')
      .replace(/export const (\w+)/g, 'exports.$1')
      .replace(/export function (\w+)/g, 'exports.$1 = function')
  }

  m.reply(output)
}

handler.help = ['toesm', 'tocjs']
handler.tags = ['tools']
handler.command = /^(toesm|tocjs)$/i
handler.limit = false

export default handler