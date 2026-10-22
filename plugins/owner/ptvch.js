import {
    prepareWAMessageMedia,
    generateMessageIDV2,
    proto,
    downloadContentFromMessage
} from 'baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
    const quoted = m.quoted

    if (!quoted) {
        return m.reply(
            `Balas video yang ingin dikirim sebagai PTV ke channel!\n\nContoh:\n${usedPrefix + command}`
        )
    }

    const mime = quoted.mimetype || ''

    if (!mime.startsWith('video/')) {
        return m.reply(
            '❗ Format tidak didukung!\n' +
            'Hanya bisa merubah video menjadi PTV (Video Bulat).'
        )
    }

    const channelId = global.chId

    await m.reply(' Mengupload PTV ke channel...')
    await m.react('🕒')

    try {
        const msgType = quoted.mtype?.replace('Message', '') || mime.split('/')[0]

        const stream = await downloadContentFromMessage(
            quoted.msg || quoted,
            msgType
        )

        const chunks = []

        for await (const chunk of stream) {
            chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        const mediaObj = {
            video: buffer,
            ptv: true,
            mimetype: mime
        }

        const msg = await prepareWAMessageMedia(
            mediaObj,
            {
                upload: conn.waUploadToServer,
                jid: channelId
            }
        )

        const node = {
            tag: 'message',
            attrs: {
                to: channelId,
                id: generateMessageIDV2(),
                type: 'media'
            },
            content: [
                {
                    tag: 'plaintext',
                    attrs: {
                        mediatype: 'ptv'
                    },
                    content: await proto.Message.encode(msg).finish()
                }
            ]
        }

        await conn.query(node)

        await m.reply('Berhasil mengirim PTV ke channel!')
        await m.react('✅')

    } catch (e) {
        console.error('[ptvch]', e)
        await m.react('❌')
        await m.reply(`❌ Gagal upload PTV: ${e.message}`)
    }
}

handler.command = /^ptvch$/i
handler.help = ['ptvch']
handler.tags = ['owner']
handler.rowner = true

export default handler