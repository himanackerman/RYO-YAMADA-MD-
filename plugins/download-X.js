import axios from "axios";
import ws from "ws";
import * as cheerio from "cheerio";

export async function twitter(url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!/x.com\/.*?\/status/gi.test(url))
                throw new Error(`URL tidak valid! Pastikan menggunakan link X (Twitter) yang benar.`);

            const base_url = "https://x2twitter.com";
            const base_headers = {
                accept: "*/*",
                "accept-language": "en-EN,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "x-requested-with": "XMLHttpRequest",
                Referer: "https://x2twitter.com/en",
            };

            const token = await axios
                .post(`${base_url}/api/userverify`, { url }, { headers: base_headers })
                .then((v) => v.data.token || "")
                .catch(() => { throw new Error("Gagal mendapatkan token."); });

            let r = await axios
                .post(`${base_url}/api/ajaxSearch`, new URLSearchParams({ q: url, lang: "id", cftoken: token }).toString(), { headers: base_headers })
                .then((v) => v.data)
                .catch(() => { throw new Error("Gagal mendapatkan data dari X."); });

            if (r.status !== "ok") throw new Error(`Gagal mendapatkan data karena ${r}`);

            const $ = cheerio.load(r.data.replace('"', '"'));
            let type = $("div").eq(0).attr("class");

            type = type.includes("tw-video") ? "video"
                : type.includes("video-data") && $(".photo-list").length ? "image"
                : "hybrid";

            let d = {};
            if (type === "video") {
                d = {
                    type,
                    download: $(".dl-action p").map((i, el) => {
                        let name = $(el).text().trim();
                        let fileType = name.includes("MP4") ? "mp4" : null;
                        let reso = fileType === "mp4" ? name.split(" ").pop().replace(//, "") : null;

                        return {
                            type: fileType,
                            reso,
                            url: $(el).find("a").attr("href"),
                        };
                    }).get(),
                };
            } else if (type === "image") {
                d = {
                    type,
                    download: $("ul.download-box li").map((i, el) => {
                        return {
                            type: "image",
                            url: $(el).find("a").attr("href"),
                        };
                    }).get(),
                };
            } else {
                d = { type, download: [] };
            }
            return resolve(d);
        } catch (e) {
            return reject(`Error: ${e.message}`);
        }
    });
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Mana Url Nya?");

    try {
        let result = await twitter(text);
        if (result.type === "video") {
            let video1024p = result.download.find(v => v.type === "mp4" && v.reso === "1024p");
            let selectedVideo = video1024p || result.download.find(v => v.type === "mp4");

            if (!selectedVideo) return conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });

            await conn.sendMessage(m.chat, { video: { url: selectedVideo.url } });
            conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        } else if (result.type === "image") {
            let selectedImage = result.download[0]; 

            if (!selectedImage) return conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });

            await conn.sendMessage(m.chat, { image: { url: selectedImage.url } });
            conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        } else {
            conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        }
    } catch (e) {
        conn.sendMessage(m.chat, { sticker: { url: 'https://files.catbox.moe/rd9i0t.jpg' } });
        m.reply(`❌ Terjadi kesalahan:\n${e}`);
    }
};

handler.help = ['twitter', 'x'];
handler.tags = ['downloader']
handler.command = ['twitter', 'x'];
handler.limit = true;

export default handler;