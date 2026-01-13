import axios from 'axios';
import cheerio from 'cheerio';

async function yt5sIo(url) {
    try {
        const form = new URLSearchParams();
        form.append("q", url);
        form.append("vt", "home");

        const response = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
            headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (response.data.status === "ok") {
            const $ = cheerio.load(response.data.data);

            if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
                const videoQualities = [];
                $('table tbody tr').each((index, element) => {
                    const quality = $(element).find('.video-quality').text().trim();
                    const downloadLink = $(element).find('a.download-link-fb').attr("href");
                    if (quality && downloadLink) {
                        videoQualities.push({ quality, downloadLink });
                    }
                });

                // Prioritize HD quality, fallback to SD
                const hdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('hd'));
                const sdVideo = videoQualities.find(v => v.quality.toLowerCase().includes('sd'));
                const videoUrl = hdVideo ? hdVideo.downloadLink : sdVideo ? sdVideo.downloadLink : null;

                if (!videoUrl) throw new Error("Tidak ada link download yang tersedia.");
                return { videoUrl };

            } else if (/^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel)\/.+/i.test(url)) {
                const videoUrl = $('a[title="Download Video"]').attr("href");
                if (!videoUrl) throw new Error("Tidak ada link download yang tersedia.");
                return { videoUrl };

            } else {
                throw new Error("URL tidak valid. Harap masukkan URL Facebook atau Instagram.");
            }
        } else {
            throw new Error("Gagal mengambil video: " + response.data.message);
        }
    } catch (error) {
        throw error;
    }
}

const handler = async (m, { conn, text }) => {
    try {
        if (!text) throw "Masukkan URL Facebook Atau Instagram.";

        const result = await yt5sIo(text);

        if (result.videoUrl) {
            await conn.sendMessage(m.chat, { video: { url: result.videoUrl }, mimetype: 'video/mp4' }, { quoted: m });
        } else {
            throw "Gagal Download ";
        }
    } catch (error) {
        await conn.sendMessage(m.chat, { text: `Error: ${error.message || error}` }, { quoted: m });
    }
};

handler.help = ['yt5so <Url Ig/Facebook>']
handler.command = ['yt5so']
handler.tags = ['downloader']
handler.limit = true;

export default handler;