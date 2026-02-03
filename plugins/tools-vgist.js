import axios from "axios"

async function getGistFiles(input) {
	const match = input.match(/([0-9a-f]{20,40})/i)
	if (!match) throw new Error('ID Gist tidak valid!')
    const apiUrl = `https://api.github.com/gists/${match[1]}`
    try {
    const res = await axios.get(apiUrl, {
        headers: { 'User-Agent': 'wa-bot-gist' }
    })

    const files = res.data.files
    const result = []

    for (const fname of Object.keys(files)) {
        const rawUrl = files[fname].raw_url
        const type = files[fname].type
        const bahasa = files[fname].language
        const isi = files[fname].content
        const size = files[fname].size
        result.push({
            fileName: fname,
            url: rawUrl,
            filesType: type,
            language: bahasa,
            fileSize: size,
            content: isi
        })
    }
    return result
    } catch (e) {
    throw new Error(e.message)
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`Contoh:\n.gist https://gist.github.com/user/abc123`)
    await m.reply('⏳ Mengambil isi Gist...')
    try {
        const files = await getGistFiles(text)
        if (!files.length) return m.reply('Tidak ada file di dalam Gist.')
        for (let file of files) {
            let teks = `*GIST GITHUB*\n> *Filename:* ${file.fileName}\n> *Language:* ${file.language}\n> *Size:* ${formatUkuranMedia(file.fileSize)}\n> *Raw:* ${file.url}`
            await conn.sendMessage(
                m.chat,
                {
                    document: { url: file.url },
                    fileName: file.fileName,
                    mimetype: file.filesType,
                    caption: teks
                },
                { quoted: m }
               )
        }
    } catch (err) {
        console.error(err)
        m.reply('❌ Gagal mengambil Gist.' + err.message)
    }
}

handler.help = ['vgist <url/id>']
handler.tags = ['tools']
handler.command = /^vgist$/i

export default handler

function formatUkuranMedia(angka) {
    if (angka >= 1024 * 1024 * 1024) {
      return (angka / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (angka >= 1024 * 1024) {
      return (angka / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (angka >= 1024) {
      return (angka / 1024).toFixed(2) + ' KB';
    } else {
      return angka + ' B';
    }
}