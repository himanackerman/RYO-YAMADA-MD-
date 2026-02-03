/**
 ╔══════════════════════
      ⧉  [Ascii] — [Tools]
 ╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Scrape      : 
  [ https://codeshare.cloudku.click/view/f2db48ac ]
  [ https://whatsapp.com/channel/0029Vb4jDY82ER6beeXLOp0k/869 ]
  ✺ Scrape Maker : [ Alfi ]
  ✺ Note    : Ga tau buat apa, biar jelas liat sini aja ( https://whatsapp.com/channel/0029Vb4jDY82ER6beeXLOp0k/866 )
*/

import * as ch from "cheerio";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!m.quoted && !(text && text.startsWith("http"))) {
            return m.reply(`*🍂 Butuh input gambar!*\n*Contoh: ${usedPrefix + command} (reply gambar atau kirim URL)*`);
        }
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let buffer = null;
        let sourceUrl = null;
        if (m.quoted?.mimetype && /image\/(jpe?g|png|webp)/i.test(m.quoted.mimetype)) {
        buffer = await m.quoted.download();
          } else if (text && text.startsWith("http")) {
    sourceUrl = text.trim();
    try {
        const r = await fetch(sourceUrl);
        if (!r.ok) return m.reply(`*🍂 Gagal ambil gambar!*\n*Status:* ${r.status} ${r.statusText}`);
        buffer = Buffer.from(await r.arrayBuffer());
    } catch {
        buffer = null;
        }
    }

        if (!buffer && !sourceUrl) {
            return m.reply(`*🍂 Format tidak valid!*\n*Gunakan: reply gambar atau URL gambar.*`);
        }

        const size = buffer ? buffer.length : 0;
        let width = 60;
        if (size && size < 150_000) width = 50;
        else if (size && size < 350_000) width = 65;
        else if (size && size < 700_000) width = 80;
        else width = 100;

        const siteBase = "https://www.text-image.com";
        const asciiPage = "/convert/ascii.html";

        const getHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        };

        const getController = new AbortController();
        const getTimeout = setTimeout(() => getController.abort(), 10000);
        const getRes = await fetch(siteBase + asciiPage, {
            method: "GET",
            signal: getController.signal,
            headers: getHeaders
        });
        clearTimeout(getTimeout);

        const setCookie = getRes.headers.get("set-cookie") ?? "";
        const initialHtml = await getRes.text();

        const buildForm = (w, useImageUrlOnly = false) => {
            const f = new FormData();
            f.append("format", "ascii");
            f.append("width", String(w));
            f.append("textcolor", "#000000");
            f.append("bgcolor", "#ffffff");
            f.append("invert", "0");
            f.append("contrast", "1");
            if (!useImageUrlOnly && buffer) f.append("image", new Blob([buffer], { type: "image/jpeg" }), "image.jpg");
            if (sourceUrl) f.append("imageurl", sourceUrl);
            return f;
        };

        const postHeadersBase = {
            Origin: siteBase,
            Referer: siteBase + asciiPage,
            "User-Agent": getHeaders["User-Agent"],
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": getHeaders["Accept-Language"]
        };

        const tryConvert = async (form) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 25000);
            const headers = { ...postHeadersBase };
            if (setCookie) headers.Cookie = setCookie.split(",").map(s => s.split(";")[0]).join("; ");
            const res = await fetch(siteBase + "/convert/result.cgi", {
                method: "POST",
                body: form,
                signal: controller.signal,
                headers
            });
            clearTimeout(timeout);
            const text = await res.text();
            return { ok: res.ok, status: res.status, text };
        };

        let res = await tryConvert(buildForm(width, false));
        if ((!res.ok || !res.text.includes('id="tiresult"')) && width !== 65) {
            res = await tryConvert(buildForm(65, false));
        }
        if ((!res.ok || !res.text.includes('id="tiresult"')) && sourceUrl) {
            res = await tryConvert(buildForm(width, true));
        }

        if (!res.ok || !res.text.includes('id="tiresult"')) {
    const html = res.text || "";

    if (html.includes("Error:")) {
        const cleanErr = html
            .split("Error:")[1]
            .split("<")[0]
            .trim();

        return m.reply(`*🍂 Gagal convert — gambar tidak dapat diproses!*\n*Alasan:* ${cleanErr}`);
    }

    return m.reply(`*🍂 Gagal convert — hasil kosong!*\n*Width:* ${width}\n*Status:* ${res.status}`);
    }

        const $ = ch.load(res.text);
        const ascii = $("#tiresult").text().trim();
        const share = $("#sharebutton").parent().find("a").attr("href") ?? null;

        if (!ascii) {
            const snippet = res.text.slice(0, 1200).replace(/\s+/g, " ");
            return m.reply(`*🍂 Gagal convert — hasil kosong!*  
*Width:* ${width}  
*HTML:* ${snippet}`);
        }

        let out = `*✨ Image To Ascii (Auto-Width) ✨*\n\n`;
        out += `*🖼️ Width otomatis:* *${width}*\n\n`;
        out += `*📄 Hasil ASCII:*\n\`\`\`\n${ascii}\n\`\`\``;
        if (share) out += `\n*🔗 Share Link:* ${share}`;

        await m.reply(out);
    } catch (e) {
        const msg = e?.message ?? "unknown error";
        m.reply(`*🍂 Terjadi kesalahan saat memproses gambar!*  
*Error:* ${msg}`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.help = ["imagetoasci"];
handler.tags = ["tools"];
handler.command = /^(imagetoasci|imgascii|ascii)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;