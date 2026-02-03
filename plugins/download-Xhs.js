import axios from "axios";

async function redNote(url) {
    try {
        const { data } = await axios.get(url);

        const extractMeta = (pattern) => (data.match(pattern) || [])[1]?.trim() || "";

        const noteId = extractMeta(/<meta\s+name="og:url"\s+content="(.*?)"/i).split('/').pop();
        const nickname = extractMeta(/<meta\s+name="og:title"\s+content="(.*?)"/i).split(" - ")[0];
        const title = extractMeta(/<title>(.*?)<\/title>/i);
        const description = extractMeta(/<meta\s+name="description"\s+content="(.*?)"/i);
        const keywords = extractMeta(/<meta\s+name="keywords"\s+content="(.*?)"/i);
        const duration = extractMeta(/<meta\s+name="og:videotime"\s+content="(.*?)"/i);
        const videoUrl = extractMeta(/<meta\s+name="og:video"\s+content="(.*?)"/i);
        const likes = extractMeta(/<meta\s+name="og:xhs:note_like"\s+content="(.*?)"/i);
        const comments = extractMeta(/<meta\s+name="og:xhs:note_comment"\s+content="(.*?)"/i);
        const collects = extractMeta(/<meta\s+name="og:xhs:note_collect"\s+content="(.*?)"/i);

        const images = [...data.matchAll(/<meta\s+name="og:image"\s+content="(.*?)"/gi)].map((match) => match[1]?.trim());

        return {
            metadata: {
                noteId,
                nickname,
                title,
                description,
                keywords,
                duration,
                likes,
                comments,
                collects,
            },
            media: {
                videoUrl,
                images,
            },
        };
    } catch (err) {
        console.error("Failed to fetch data:", err.message);
        return null;
    }
}

let handler = async (m, { text, conn }) => {
    if (!text) return m.reply("Mana Url Nyah!");

    const result = await redNote(text);
    if (!result) return m.reply("Terkadi Kesalahan Pastikan URL valid!");

    let { media } = result;

    await conn.sendMessage(m.chat, {
        sticker: { url: "https://files.catbox.moe/0ksa1n.webp" }
    }, { quoted: m });

    if (media.videoUrl) {
        await conn.sendMessage(m.chat, {
            video: { url: media.videoUrl }
        });
    } else if (media.images.length > 0) {
        for (let img of media.images) {
            await conn.sendMessage(m.chat, {
                image: { url: img }
            });
        }
    } else {
        m.reply("Terjadi Error");
    }
};

handler.help = ['xhs'];
handler.tags = ['downloader']
handler.command = ['xhs'];
handler.limit = true;

export default handler;