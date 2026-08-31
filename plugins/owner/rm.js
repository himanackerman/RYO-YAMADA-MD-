/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

import {
    tmpdir
} from 'os'
import path, {
    join
} from 'path'
import {
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    readFileSync,
    watch
} from 'fs'
let handler = async (m, {
    conn,
    usedPrefix,
    usedPrefix: _p,
    __dirname,
    args,
    text,
    command
}) => {

    if (!text) throw `uhm.. where the text?\n\nexample:\n${usedPrefix + command} scraper/xxx.js`
    try {
        const file = join(__dirname, '../' + text)
        unlinkSync(file)
        conn.reply(m.chat, `Succes deleted "${text}"`, m)
    } catch (e) {
        m.reply('folder not found :' + e)
    } finally {

    }
}
handler.help = ['rm']
handler.tags = ['owner']
handler.command = /^(rm)$/i

handler.rowner = true

export default handler