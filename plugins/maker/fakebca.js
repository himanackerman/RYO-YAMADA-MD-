/**
‎✧ Name   : fake bca
‎✧ Creator   : Rin imup lucu🤤
‎✧ Category : Canvas
‎✧ Link sumber : https://whatsapp.com/channel/0029Vb6EHtR5Ui2gHMW9zX2x
‎✧ *Note* : Jangan hapus wm ya hargai dari sumber share nya,gak mudah buat canvas jangan seenak nya copy terus hapus credit ketauan hapus ? liat aja mata" gw banyak nanti viral😂
‎**/

import axios from 'axios'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`*Format salah!*\n\nContoh penggunaan:\n.${command} RIN IMUP|111 - 222 - 3333|1,000,000`)

    const [namaPayload, rekPayload, saldoPayload] = text.split('|')
    if (!namaPayload || !rekPayload || !saldoPayload) return m.reply(`*Format salah!*\n\nPastikan menggunakan pemisah tanda garis (|)\nContoh:\n.${command} RIN IMUP|111 - 222 - 3333|1,000,000`)

    const txtNama = namaPayload.trim().toUpperCase()
    const txtRek = rekPayload.trim()
    const txtSaldo = saldoPayload.trim()

    try {
        await m.reply('⏳ Memproses gambar Fake BCA...')

        const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/allimagerin/refs/heads/main/F1.png'
        const ASSETS_DIR = join(process.cwd(), 'assets', 'bcadash')
        const FONTS_DIR = join(ASSETS_DIR, 'fonts')
        const BG_LOCAL = join(ASSETS_DIR, 'template_f1.png')
        const TMP_DIR = '/tmp'

        await mkdir(FONTS_DIR, { recursive: true })
        await mkdir(TMP_DIR, { recursive: true })

        async function dlBuf(url) {
            const res = await axios.get(url, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0' } })
            return Buffer.from(res.data)
        }

        const fontConfigs = [
            { url: 'https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1xlFQ.woff2', name: 'Poppins-SemiBold.ttf', family: 'PoppinsBca' },
            { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', name: 'Inter-Medium.ttf', family: 'InterMediumBca' },
            { url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', name: 'Inter-Bold.ttf', family: 'InterBoldBca' }
        ]

        for (const f of fontConfigs) {
            const fPath = join(FONTS_DIR, f.name)
            if (!existsSync(fPath)) await writeFile(fPath, await dlBuf(f.url))
            GlobalFonts.registerFromPath(fPath, f.family)
        }

        if (!existsSync(BG_LOCAL)) await writeFile(BG_LOCAL, await dlBuf(BG_URL))

        const bgImg = await loadImage(BG_LOCAL)
        const canvas = createCanvas(bgImg.width, bgImg.height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '600 27px PoppinsBca'
        ctx.fillText(txtNama, 127, 56)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '500 28px InterMediumBca'
        ctx.fillText(txtRek, 211, 219)

        ctx.fillStyle = '#4F4F4F'
        ctx.font = '700 43px InterBoldBca'
        ctx.fillText(txtSaldo, 156, 361)

        const outBuf = await canvas.encode('png')
        const outPath = join(TMP_DIR, `bca-${Date.now()}.png`)
        await writeFile(outPath, outBuf)

        await conn.sendFile(m.chat, outPath, 'bca.png', '', m)

        unlink(outPath).catch(() => {})

    } catch (err) {
        console.error(err)
        m.reply('❌ Gagal membuat gambar fake BCA\n\n' + err.message)
    }
}

handler.help = ['fakebca']
handler.tags = ['maker']
handler.command = ['fakebca']
export default handler