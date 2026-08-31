/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Scraper    : ONLym-Api
 * 👤 Integrator : Lynx Decode
 * 📞 Contact    : +62 882-5804-1396
 * 📢 Channel    : https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i
 * ⚠️ Note       : Keep credit to respect the creator!
 * ─────────────────────────
 * 📝 Plugin: Upscale Image (PicsArt AI)
 */

import fetch from 'node-fetch'

class PicsartEnhancer {
    constructor() {
        this.uploadUrl = 'https://upload.picsart.com/files';
        this.aiUrl = 'https://ai.picsart.com';
        this.jsUrl = 'https://picsart.com/-/landings/4.310.0/static/index-C3-HwnoW-GZgP7cLS.js';
        this.token = null;
        this.headers = {
            'origin': 'https://picsart.com',
            'referer': 'https://picsart.com/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'accept': '*/*'
        };
    }

    async getToken() {
        const resp = await fetch(this.jsUrl, { headers: this.headers });
        const text = await resp.text();
        const match = text.match(/"x-app-authorization":"Bearer\s+([^"]+)"/);
        if (match?.[1]) {
            this.token = match[1];
            return this.token;
        }
        throw new Error('Token otorisasi API tidak ditemukan dari server PicsArt.');
    }

    async upload(buffer) {
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);

        let body = `--${boundary}\r\n`;
        body += 'Content-Disposition: form-data; name="type"\r\n\r\n';
        body += 'editing-temp-landings\r\n';
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="file"; filename="image.jpg"\r\n`;
        body += `Content-Type: image/jpeg\r\n\r\n`;

        const part1 = Buffer.from(body, 'utf-8');
        const part2 = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="url"\r\n\r\n\r\n--${boundary}\r\nContent-Disposition: form-data; name="metainfo"\r\n\r\n\r\n--${boundary}--\r\n`, 'utf-8');
        const data = Buffer.concat([part1, buffer, part2]);

        const resp = await fetch(this.uploadUrl, {
            method: 'POST',
            headers: {
                ...this.headers,
                'content-type': `multipart/form-data; boundary=${boundary}`,
                'accept': 'application/json'
            },
            body: data
        });
        return await resp.json();
    }

    async enhance(url, scale, faceEnhance, faceBlend) {
        if (!this.token) await this.getToken();
        
        const params = new URLSearchParams({
            picsart_cdn_url: url,
            format: 'PNG',
            model: 'REALESERGAN'
        });

        const body = JSON.stringify({
            image_url: url,
            colour_correction: { enabled: false, blending: 0.5 },
            seed: 42,
            upscale: { enabled: true, node: 'esrgan', target_scale: scale },
            face_enhancement: { enabled: faceEnhance, face_blending_cbcr: faceBlend }
        });

        const resp = await fetch(`${this.aiUrl}/gw1/diffbir-enhancement-service/v1.7.6?${params}`, {
            method: 'POST',
            headers: {
                ...this.headers,
                'accept': 'application/json',
                'content-type': 'application/json',
                'platform': 'website',
                'x-app-authorization': `Bearer ${this.token}`,
                'x-touchpoint': 'widget_EnhancedImage',
                'x-touchpoint-referrer': '/ai-image-enhancer/',
                'task-mode': 'async'
            },
            body
        });
        return await resp.json();
    }

    async checkStatus(id) {
        if (!this.token) await this.getToken();

        const resp = await fetch(`${this.aiUrl}/gw1/diffbir-enhancement-service/v1.7.6/${id}`, {
            method: 'GET',
            headers: {
                ...this.headers,
                'accept': 'application/json',
                'x-app-authorization': `Bearer ${this.token}`,
                'platform': 'website'
            }
        });
        return await resp.json();
    }

    async run(buffer, scale = 2, faceEnhance = false, faceBlend = 0.5) {
        const upload = await this.upload(buffer);
        if (upload.status !== 'success') throw new Error('Gagal mengunggah gambar ke server PicsArt.');

        let responseData = await this.enhance(upload.result.url, scale, faceEnhance, faceBlend);
        if (!responseData || (responseData.status !== 'ACCEPTED' && responseData.status !== 'DONE')) {
            throw new Error('Gagal membuat antrean pemrosesan gambar.');
        }

        const taskId = responseData.id;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            const checkData = await this.checkStatus(taskId);

            if (checkData.status === 'DONE' && checkData.result?.image_url) {
                const imageFetch = await fetch(checkData.result.image_url);
                if (!imageFetch.ok) throw new Error(`Gagal mengunduh gambar hasil dari CDN (HTTP ${imageFetch.status})`);
                return Buffer.from(await imageFetch.arrayBuffer());
            } else if (checkData.status === 'FAILED' || checkData.error_message) {
                throw new Error(`AI Picsart gagal memproses: ${checkData.error_message}`);
            }
        }
        throw new Error('Timeout: Batas waktu tunggu antrean server habis.');
    }
}

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime.includes('image')) {
        return m.reply(`┌˚₊ ๑│ ᴜ ᴘ ꜱ ᴄ ᴀ ʟ ᴇ  ᴀ ɪ │๑˚₊ 🪄\n┇ \n│ ❌ *Gambarnya mana cuy?*\n│ \n│ 📌 *Cara pakai:*\n│ Kirim gambar dengan caption *${usedPrefix + command}*\n│ atau balas gambar yang udah ada.\n┇ \n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`)
    }

    await m.react('⏳')

    try {
        let media = await q.download()
        if (!media) throw new Error('Gagal mengunduh gambar dari pesan.')
        const pica = new PicsartEnhancer()
        const resultBuffer = await pica.run(media, 2, false, 0.5)

        let caption = `┌˚₊ ๑│ ᴜ ᴘ ꜱ ᴄ ᴀ ʟ ᴇ  ᴀ ɪ │๑˚₊ 🪄\n┇ \n│ ✅ *Berhasil memperjernih gambar!*\n│ ⚙️ *Engine:* PicsArt AI (ESRGAN)\n┇ \n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`

        await conn.sendMessage(m.chat, { 
            image: resultBuffer, 
            caption: caption 
        }, { quoted: m })

        await m.react('✅')
    } catch (error) {
        console.error('[UPSCALE ERROR]', error)
        await m.react('❌')
        m.reply(`┌˚₊ ๑│ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ  ᴇ ʀ ʀ ᴏ ʀ │๑˚₊ ❌\n┇ Gagal memproses gambar.\n┇ \n┇ *Detail:*\n┇ ${error.message || String(error)}\n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`)
    }
}

handler.help = ['picsart']
handler.tags = ['image']
handler.command = /^(picsart)$/i
handler.limit = true

export default handler