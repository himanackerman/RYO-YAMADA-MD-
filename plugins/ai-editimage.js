/*
fitur : image editor
source : https://whatsapp.com/channel/0029Vb67i65Fi8xX7rOtIc2S
scraper : https://whatsapp.com/channel/0029Vb7t6q7A89MjyGEBG41y/139
*/


import axios from 'axios'
import CryptoJS from 'crypto-js'

const aeskey = 'ai-enhancer-web__aes-key'
const aesiv = 'aienhancer-aesiv'

const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://aienhancer.ai',
    'Referer': 'https://aienhancer.ai/ai-image-editor'
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) throw `Kirim atau reply gambar dengan caption:\n*${usedPrefix + command}* ubah jadi tersenyum`
    if (!text) throw `Masukkan perintah modifikasi gambarnya!`

    await m.react('🪄')

    try {
        let img = await q.download()
        let base64 = `data:image/jpeg;base64,${img.toString('base64')}`

        let isSafe = await nsfwcheck(base64)
        if (isSafe !== 'normal') return m.reply('❌ Gambar terdeteksi mengandung konten tidak pantas dan diblokir oleh sistem.')

        let result = await imageditor(base64, text)
        
        await conn.sendMessage(m.chat, { 
            image: { url: result.output }, 
            caption: `✅ *AI Image Editor Success*\n\n📝 *Prompt:* ${text}` 
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat memproses gambar.')
    }
}

function encrypt(obj) {
    return CryptoJS.AES.encrypt(
        JSON.stringify(obj),
        CryptoJS.enc.Utf8.parse(aeskey),
        {
            iv: CryptoJS.enc.Utf8.parse(aesiv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    ).toString()
}

async function nsfwcheck(image) {
    const create = await axios.post('https://aienhancer.ai/api/v1/r/nsfw-detection', { image }, { headers })
    const id = create.data.data.id
    for (;;) {
        await new Promise(r => setTimeout(r, 2000))
        const res = await axios.post('https://aienhancer.ai/api/v1/r/nsfw-detection/result', { task_id: id }, { headers })
        if (res.data.data.status === 'succeeded') return res.data.data.output
    }
}

async function imageditor(image, prompt) {
    const settings = encrypt({
        prompt,
        size: '2K',
        aspect_ratio: 'match_input_image',
        output_format: 'jpeg',
        max_images: 1
    })
    const create = await axios.post('https://aienhancer.ai/api/v1/k/image-enhance/create', {
        model: 2,
        image,
        function: 'ai-image-editor',
        settings
    }, { headers })
    const id = create.data.data.id
    for (;;) {
        await new Promise(r => setTimeout(r, 2500))
        const res = await axios.post('https://aienhancer.ai/api/v1/k/image-enhance/result', { task_id: id }, { headers })
        if (res.data.data.status === 'success') return res.data.data
    }
}

handler.help = ['ai-edit <prompt>']
handler.tags = ['ai',]
handler.command = /^(aiedit|ai-edit)$/i
handler.limit = true

export default handler