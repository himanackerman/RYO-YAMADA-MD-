/**
 *  instagram downloader 
 * -----------------------------
 * type   : Plugins ESM
 * creator : Hilman
 * Channel : https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
 * base : https://igexport.com
 */

import fetch from 'node-fetch'

const anu = {
    igexport: 'https://igexport.com'
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(
            `Contoh:\n${usedPrefix + command} https://www.instagram.com/p/xxxxx/`
        )
    }

    const url = args[0].trim()

    if (!/instagram\.com\/(?:p|reel|reels|tv)\//i.test(url)) {
        return m.reply('Link Instagram tidak valid.')
    }

    try {
        const isReel = /instagram\.com\/(?:reel|reels|tv)\//i.test(url)

        const endpoint = isReel
            ? `${anu.igexport}/api/ig-reels/?url=`
            : `${anu.igexport}/api/ig-photo/?url=`

        const res = await fetch(
            endpoint + encodeURIComponent(url),
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Referer': `${anu.igexport}/id/video-download/`
                }
            }
        )

        const data = await res.json()

        if (!res.ok || !data?.ok) {
            throw new Error('Media Instagram tidak ditemukan.')
        }

        if (isReel) {
            const media = data.media

            if (!media?.videoUrl) {
                throw new Error('Video Instagram tidak ditemukan.')
            }

            await conn.sendMessage(
                m.chat,
                {
                    video: { url: media.videoUrl },
                    mimetype: 'video/mp4',
                    fileName: media.filename || 'instagram.mp4'
                },
                { quoted: m }
            )

            return
        }

        const items = (data.media?.items || []).filter(item => item?.url)

        if (!items.length) {
            throw new Error('Media Instagram tidak ditemukan.')
        }

        if (items.length === 1) {
            const item = items[0]

            if (item.type === 'video') {
                await conn.sendMessage(
                    m.chat,
                    {
                        video: { url: item.url },
                        mimetype: 'video/mp4',
                        fileName: item.filename || 'instagram.mp4'
                    },
                    { quoted: m }
                )
            } else {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: item.url },
                        fileName: item.filename || 'instagram.webp'
                    },
                    { quoted: m }
                )
            }

            return
        }

        const albumMedias = items.map(item =>
            item.type === 'video'
                ? {
                    video: { url: item.url },
                    mimetype: 'video/mp4',
                    fileName: item.filename || 'instagram.mp4'
                }
                : {
                    image: { url: item.url },
                    fileName: item.filename || 'instagram.webp'
                }
        )

        await conn.sendAlbumMessage(
            m.chat,
            albumMedias,
            {
                delay: 300,
                quoted: m
            }
        )
    } catch (e) {
        console.error(e)
        m.reply(`Gagal mengunduh Instagram.\n${e.message}`)
    }
}

handler.help = ['instagram <url>']
handler.tags = ['downloader']
handler.command = /^(ig|instagram)$/i
handler.limit = true
handler.register = false

export default handler
