import axios from 'axios';
import cheerio from 'cheerio';

async function pindl(url) {
    try {
        let a = await axios.get(url, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/17.0 Chrome/96.0.4664.104 Mobile Safari/537.36",
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        let $ = cheerio.load(a.data);
        let x = $('script[data-test-id="leaf-snippet"]').text();
        let y = $('script[data-test-id="video-snippet"]').text();

        let g = {
            status: true,
            isVideo: y ? true : false,
            info: JSON.parse(x),
            image: JSON.parse(x).image,
            video: y ? JSON.parse(y).contentUrl : ''
        };

        return g;
    } catch (e) {
        return {
            status: false,
            mess: "failed download"
        };
    }
}

const handler = async (m, { conn, text }) => {
    if (!text) return conn.sendMessage(m.chat, { text: 'Kirimkan link Pinterest untuk download gambar atau video' }, { quoted: m });

    const url = text.trim();
    const result = await pindl(url);

    if (result.status) {
        if (result.isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: result.video }
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: result.image }
            }, { quoted: m });
        }
    } else {
        await conn.sendMessage(m.chat, { text: result.mess }, { quoted: m });
    }
};

handler.help = ['pindl'].map(v => v + ' ');
handler.tags = ["downloader"]
handler.command = /^(pindl)$/i;
handler.limit = true;

export default handler;