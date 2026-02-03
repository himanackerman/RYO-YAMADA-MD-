import axios from "axios";
import * as cheerio from "cheerio";

let handler = async (m, { text }) => {
  if (!text)
    return m.reply("Contoh:\n.ikiru Solo Leveling");

  try {
    let html = null;

    /* =========================
       1. COBA SEARCH LANGSUNG
    ========================= */
    try {
      const res = await axios.post(
        "https://02.ikiru.wtf/wp-admin/admin-ajax.php",
        new URLSearchParams({
          action: "search",
          query: text
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "HX-Request": "true",
            "HX-Target": "searchModalContent",
            "HX-Current-URL": "https://02.ikiru.wtf/",
            "User-Agent":
              "Mozilla/5.0 (Android 12; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
            "Referer": "https://02.ikiru.wtf/"
          }
        }
      );

      html = res.data;
    } catch {
      html = null;
    }

    /* =========================
       2. FALLBACK: AMBIL NONCE
    ========================= */
    if (!html || !html.includes("<a")) {
      const home = await axios.get("https://02.ikiru.wtf/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Android 12; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0"
        }
      });

      const nonce =
        home.data.match(/nonce["']?\s*:\s*["']([a-z0-9]+)["']/i)?.[1] ||
        home.data.match(/data-nonce=["']([a-z0-9]+)["']/i)?.[1];

      if (!nonce)
        return m.reply("❌ Gagal mengambil nonce Ikiru.");

      const res = await axios.post(
        "https://02.ikiru.wtf/wp-admin/admin-ajax.php",
        new URLSearchParams({
          nonce,
          action: "search",
          query: text
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "HX-Request": "true",
            "HX-Target": "searchModalContent",
            "HX-Current-URL": "https://02.ikiru.wtf/",
            "User-Agent":
              "Mozilla/5.0 (Android 12; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
            "Referer": "https://02.ikiru.wtf/"
          }
        }
      );

      html = res.data;
    }

    /* =========================
       3. PARSE RESULT
    ========================= */
    const $ = cheerio.load(html);
    const results = [];
    const seen = new Set();

    $("a:has(h4)").each((_, el) => {
      const link = $(el).attr("href");
      if (!link || seen.has(link)) return;

      const title = $(el).find("h4").first().text().trim();
      if (!title) return;

      let type = "";
      $(el)
        .find("span")
        .each((_, sp) => {
          const t = $(sp).text().trim();
          if (/^(Manhwa|Manga|Manhua)$/i.test(t)) {
            type = t;
            return false;
          }
        });

      let cover = null;
      $(el)
        .find("img")
        .each((_, img) => {
          const src =
            $(img).attr("data-src") ||
            $(img).attr("src");
          if (src && !src.includes("logo")) {
            cover = src;
            return false;
          }
        });

      seen.add(link);
      results.push({ title, link, type, cover });
    });

    if (!results.length)
      return m.reply("❌ Tidak ditemukan hasil.");

    /* =========================
       4. KIRIM LIST + COVER
    ========================= */
    let msg = `🔍 *Hasil Pencarian Ikiru*\n\n`;

    results.slice(0, 10).forEach((v, i) => {
      msg +=
        `*${i + 1}. ${v.title}*\n` +
        `${v.type ? v.type + "\n" : ""}` +
        `${v.link}\n\n`;
    });

    const cover = results[0]?.cover;

    if (cover) {
      await m.reply({
        image: { url: cover },
        caption: msg.trim()
      });
    } else {
      await m.reply(msg.trim());
    }

  } catch (e) {
    console.error(e);
    m.reply("❌ Gagal mengambil data dari Ikiru.");
  }
};

handler.command = /^ikiru$/i;
handler.tags = ["search", "anime"];
handler.help = ["ikiru <judul>"];

export default handler;