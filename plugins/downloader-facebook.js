/* 
Downloader Facebook
Source Scrape : https://whatsapp.com/channel/0029VbBJKfE0gcfCAJZEVh3R/125
*/
import axios from "axios";

async function getToken() {
  const url = "https://fbdownloader.to/id";
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const regex = /k_exp="(.*?)".*?k_token="(.*?)"/s;
  const match = html.match(regex);
  if (!match) throw new Error("Token tidak ditemukan");

  return {
    k_exp: match[1],
    k_token: match[2]
  };
}

async function fbDownloader(fbUrl) {
  const { k_exp, k_token } = await getToken();

  const payload = new URLSearchParams({
    k_exp,
    k_token,
    p: "home",
    q: fbUrl,
    lang: "id",
    v: "v2",
    W: ""
  });

  const { data } = await axios.post("https://fbdownloader.to/api/ajaxSearch", payload, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      "X-Requested-With": "XMLHttpRequest",
      "Origin": "https://fbdownloader.to",
      "Referer": "https://fbdownloader.to/id"
    }
  });

  if (!data || !data.data) throw new Error("Gagal mengambil data video");

  const html = data.data;
  const results = [];

  const rowRegex = /<td class="video-quality">(.*?)<\/td>[\s\S]*?(?:href="(.*?)"|data-videourl="(.*?)")/g;
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const quality = match[1].trim();
    const url = match[2] || match[3];
    if (quality && url) results.push({ quality, url });
  }

  return results;
}

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("Masukkan link Facebook terlebih dahulu, contoh:\n.fb https://facebook.com/...");

  try {
    const results = await fbDownloader(text);
    if (!results.length) return m.reply("❌ Tidak ada video ditemukan.");

    const videoUrl = results[0].url;

    const { data: buffer } = await axios.get(videoUrl, { responseType: 'arraybuffer' });

    await conn.sendMessage(m.chat, { video: buffer, caption: `📥 Download dari Facebook\nKualitas: ${results[0].quality}` }, { quoted: m });
  } catch (e) {
    m.reply("❌ Gagal mengunduh video: " + e.message);
  }
};

handler.help = ['facebook <link>'];
handler.tags = ['downloader'];
handler.command = /^fb|facebook$/i;
handler.limit = true;
export default handler;