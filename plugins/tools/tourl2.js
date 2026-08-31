import axios from 'axios';
import FormData from 'form-data';

async function uploadImage(imageBuffer) {
    try {
        const form = new FormData();
        form.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        const headers = {
            ...form.getHeaders(),
            'Content-Length': form.getLengthSync()
        };

        const response = await axios.post('https://www.pic.surf/upload.php', form, { headers });
        const identifier = response.data.identifier;

        return `https://www.pic.surf/${identifier}`;
    } catch (error) {
        throw new Error(`Upload gagal: ${error.response ? error.response.data : error.message}`);
    }
}

const handler = async (m, { conn }) => {
    try {
        await m.react('⌛');

        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        if (!mime.startsWith('image')) throw 'Silakan reply gambar atau kirim gambar dengan caption command.';

        let media = await q.download();
        let imageUrl = await uploadImage(media);

        await m.react('✅');

        let caption = `*${imageUrl}*`;

        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (error) {
        await m.react('❌');
        await conn.sendMessage(m.chat, { text: `❌ *Error:* ${error.message}` }, { quoted: m });
    }
};

handler.help = ['upload'];
handler.tags = ['tools']
handler.command = ['upload'];
handler.limit = false;

export default handler;