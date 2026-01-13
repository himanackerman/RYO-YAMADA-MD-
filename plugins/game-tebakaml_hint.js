let handler = async (m, { conn }) => {
    conn.tebakanml = conn.tebakanml ? conn.tebakanml : {}
    let id = m.chat
    if (!(id in conn.tebakanml)) throw false
    let json = conn.tebakanml[id][1]
    let ans = json.jawaban
    let clue = ans.replace(/[AIUEOaiueo]/g, '_')
    conn.reply(m.chat, '```' + clue + '```\nBalas Soalnya, Bukan Pesan Ini', conn.tebakanime[id][0])
}
handler.command = /^emel$/i
handler.limit = true
export default handler
