import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

const codeAI = {
    api: {
        base: 'https://django-app-4tbtjdxw2a-uc.a.run.app',
        endpoints: {
            promptToCode: '/prompt_to_code/',
            detectBugs: '/detect_bugs/',
            convertCode: '/convert_code/',
            explainCode: '/code_explainer/',
            imageToSolve: '/image_to_solve/'
        }
    },

    headers: {
        'user-agent': 'NB Android/1.0.0',
        'content-type': 'application/json',
        'accept': 'application/json'
    },

    languages: {
        html: 1, c: 2, 'c++': 3, 'c#': 4, dart: 5, java: 6, swift: 7, python: 8, r: 9,
        javascript: 10, matlab: 11, ruby: 12, typescript: 13, kotlin: 14, go: 15, jshell: 16,
        python2: 17, groovy: 18, nodejs: 19, scala: 20, assembly: 21, julia: 22, 'objective-j': 23,
        rust: 24, react: 25, angular: 26, perlu: 27, lua: 28, php: 29, jquery: 30, bootstrap: 31,
        vue: 32, 'objective-c': 33, clojure: 34, vue3: 35, fotran: 36, cobol: 37, crystal: 38
    },

    ip: () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.'),

    promptToCode: async (prompt, language) => {
        const langId = codeAI.languages[language?.toLowerCase()]
        if (!prompt || !langId) return { success: false, result: { error: 'Prompt ama bahasanya jangan kosong 🗿' } }
        try {
            let { data } = await axios.post(
                codeAI.api.base + codeAI.api.endpoints.promptToCode,
                { prompt: prompt.trim(), language: langId, ip_address: codeAI.ip() },
                { headers: codeAI.headers }
            )
            if (data.Status !== 1) return { success: false, result: { error: data.Message || 'Gagal generate code' } }
            return { success: true, result: data.Data }
        } catch {
            return { success: false, result: { error: 'Error bree 🙃' } }
        }
    },

    detectBugs: async (code) => {
        if (!code) return { success: false, result: { error: 'Kodenya kosong 😂' } }
        try {
            let { data } = await axios.post(
                codeAI.api.base + codeAI.api.endpoints.detectBugs,
                { code: code.trim(), ip_address: codeAI.ip() },
                { headers: codeAI.headers }
            )
            if (data.Status !== 1) return { success: false, result: { error: data.Message || 'Gagal detect bug' } }
            return { success: true, result: data.Data }
        } catch {
            return { success: false, result: { error: 'Error bree 🫵🏻🤣' } }
        }
    },

    convertCode: async (code, sourceLanguage, targetLanguage) => {
        const targetId = codeAI.languages[targetLanguage?.toLowerCase()]
        if (!code || !targetId) return { success: false, result: { error: 'Code ama target bahasa jangan kosong 🗿' } }
        try {
            let { data } = await axios.post(
                codeAI.api.base + codeAI.api.endpoints.convertCode,
                { prompt: sourceLanguage ? `${sourceLanguage}\n\n${code}` : code.trim(), language: targetId, ip_address: codeAI.ip() },
                { headers: codeAI.headers }
            )
            if (data.Status !== 1) return { success: false, result: { error: data.Message || 'Gagal convert code' } }
            return { success: true, result: data.Data }
        } catch {
            return { success: false, result: { error: 'Error bree 😂' } }
        }
    },

    explainCode: async (code, language) => {
        if (!code) return { success: false, result: { error: 'Kodenya kosong 🗿' } }
        try {
            let { data } = await axios.post(
                codeAI.api.base + codeAI.api.endpoints.explainCode,
                { code: code.trim(), optional_param: language || '', ip_address: codeAI.ip() },
                { headers: codeAI.headers }
            )
            if (data.Status !== 1) return { success: false, result: { error: data.Message || 'Gagal jelasin code' } }
            return { success: true, result: data.Data }
        } catch {
            return { success: false, result: { error: 'Error bree 😂' } }
        }
    },

    imageToSolve: async (prompt, imagex, language) => {
        const langId = codeAI.languages[language?.toLowerCase()]
        if (!langId || !imagex) return { success: false, result: { error: 'Bahasa & gambar wajib ada 🗿' } }
        try {
            let formData = new FormData()
            formData.append('prompt', prompt || '')
            formData.append('image', fs.createReadStream(imagex))
            formData.append('ip_address', codeAI.ip())
            formData.append('language', langId)

            let { data } = await axios.post(
                codeAI.api.base + codeAI.api.endpoints.imageToSolve,
                formData,
                { headers: formData.getHeaders() }
            )
            if (data.Status !== 1) return { success: false, result: { error: data.Message || 'Gagal solve image' } }
            return { success: true, result: data.Data }
        } catch (err) {
            return { success: false, result: { error: err.message || 'Error bree 😂' } }
        }
    }
}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    try {
        if (command === 'promptcode') {
            if (!text.includes('|')) return m.reply(`Format: ${usedPrefix + command} bahasa|prompt`)
            let [lang, ...prm] = text.split('|')
            let res = await codeAI.promptToCode(prm.join('|').trim(), lang)
            if (!res.success) return m.reply(res.result.error)
            m.reply(`📌 *${res.result.title}*\n📝 Bahasa: ${res.result.language}\n\n\`\`\`${res.result.code}\`\`\`\n\n💡 ${res.result.explanation}`)
        }

        if (command === 'detectbug') {
            if (!text) return m.reply(`Format: ${usedPrefix + command} kode`)
            let res = await codeAI.detectBugs(text)
            if (!res.success) return m.reply(res.result.error)
            m.reply(`🐞 *${res.result.title}*\n📝 Bahasa: ${res.result.language}\n\n\`\`\`${res.result.code}\`\`\`\n\n💡 ${res.result.explanation}`)
        }

        if (command === 'convertcode') {
            if (!text.includes('|')) return m.reply(`Format: ${usedPrefix + command} targetBahasa|kode`)
            let [lang, ...cd] = text.split('|')
            let res = await codeAI.convertCode(cd.join('|').trim(), null, lang)
            if (!res.success) return m.reply(res.result.error)
            m.reply(`🔄 *${res.result.title}*\n📝 Bahasa: ${res.result.language}\n\n\`\`\`${res.result.code}\`\`\`\n\n💡 ${res.result.explanation}`)
        }

        if (command === 'explaincode') {
            let lang = '', code
            if (text.includes('|')) {
                let sp = text.split('|')
                lang = sp[0]
                code = sp.slice(1).join('|').trim()
            } else code = text.trim()
            if (!code) return m.reply(`Format: ${usedPrefix + command} bahasa(optional)|kode`)
            let res = await codeAI.explainCode(code, lang)
            if (!res.success) return m.reply(res.result.error)
            m.reply(`📖 *${res.result.title}*\n📝 Bahasa: ${res.result.language}\n\n\`\`\`${res.result.code}\`\`\`\n\n💡 ${res.result.explanation}`)
        }

        if (command === 'imagesolve') {
            if (!text.includes('|')) return m.reply(`Format: ${usedPrefix + command} bahasa|caption(optional)`)
            let [lang, ...prm] = text.split('|')
            let prompt = prm.join('|').trim()
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image/.test(mime)) return m.reply('Kirim/reply gambar dengan command ini')
            let img = await q.download()
            let path = `./tmp/${Date.now()}.jpg`
            fs.writeFileSync(path, img)
            let res = await codeAI.imageToSolve(prompt, path, lang)
            fs.unlinkSync(path)
            if (!res.success) return m.reply(res.result.error)
            m.reply(`🖼️ *${res.result.title}*\n📝 Bahasa: ${res.result.language}\n\n\`\`\`${res.result.code}\`\`\`\n\n💡 ${res.result.explanation}`)
        }
    } catch (e) {
        m.reply('Error: ' + e.message)
    }
}

handler.help = ['promptcode', 'detectbug', 'convertcode', 'explaincode', 'imagesolve']
handler.tags = ['tools']
handler.command = /^(promptcode|detectbug|convertcode|explaincode|imagesolve)$/i
handler.limit = true

export default handler