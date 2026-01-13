/**
 ╔══════════════════════
      ⧉  [umachar] — [anime]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Scrape      : 
  [ https://pastebin.com/9ajVVJKZ ]
  [ https://whatsapp.com/channel/0029VbAfwbXEQIare6lrHB0E/176 ]
  ✺ Scrape Maker : [ Bella ]
  ✺ Note    : Nah ini, baru lumayan lengkap dan benar, btw nama Uma nya harus kapital awalannya ya
*/

import * as cheerio from "cheerio";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`*Contoh: ${usedPrefix + command} Agnes tachyon*`);
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const slug = text.trim().replace(/\s+/g, "_");
        const url = `https://umamusume.fandom.com/wiki/${slug}`;

        const res = await fetch(url);
        if (!res.ok) throw 'Fetch gagal';
        const html = await res.text();
        const $ = cheerio.load(html);

        const infobox = $("aside.portable-infobox");

        const getField = label => {
            const f = infobox.find(`h3:contains("${label}")`).parent();
            return f.find(".pi-data-value").text().trim() || null;
        };

        const info = {};
        info.name = getField("Name");
        info.kana = getField("Kana");
        info.romaji = getField("Romaji");
        info.t_chinese = getField("T. Chn.");
        info.species = getField("Species");
        info.birthday = getField("Birthday");
        info.gender = getField("Gender");
        info.height = getField("Height");
        info.three_sizes = getField("Three Sizes");
        info.occupation = getField("Occupation");
        info.voice_actor = getField("Japanese");

        info.affiliation = [];
        infobox.find(`h3:contains("Affiliation")`).parent().find("li").each((i, el) => {
            info.affiliation.push($(el).text().trim());
        });

        info.images = [];
        infobox.find(".pi-image-collection__image img").each((i, el) => {
            const img = $(el).attr("src");
            if (img) info.images.push(img);
        });

        const jsonLD = $('script[type="application/ld+json"]').html();
        if (jsonLD) {
            try {
                const parsed = JSON.parse(jsonLD);
                if (parsed.image) info.images.push(parsed.image);
            } catch {}
        }

        const getSection = id => {
            const h = $(`span#${id}`).parent();
            const sec = h.next();
            return sec.text().trim() || null;
        };

        info.profile = getSection("Profile");
        info.appearance = getSection("Appearance");

        if (!info.name) throw 'Data kosong';

        let caption = `*🐎 UMAMUSUME CHARACTER DETAIL*\n\n`;
        caption += `*✨ Name:* ${info.name}\n`;
        if (info.kana) caption += `*🈶 Kana:* ${info.kana}\n`;
        if (info.romaji) caption += `*🔤 Romaji:* ${info.romaji}\n`;
        if (info.t_chinese) caption += `*🀄 Chinese:* ${info.t_chinese}\n`;
        if (info.species) caption += `*🧬 Species:* ${info.species}\n`;
        if (info.birthday) caption += `*🎂 Birthday:* ${info.birthday}\n`;
        if (info.gender) caption += `*🚺 Gender:* ${info.gender}\n`;
        if (info.height) caption += `*📏 Height:* ${info.height}\n`;
        if (info.three_sizes) caption += `*🎯 Three Sizes:* ${info.three_sizes}\n`;
        if (info.occupation) caption += `*🎓 Occupation:* ${info.occupation}\n`;
        if (info.voice_actor) caption += `*🎙️ Voice Actor:* ${info.voice_actor}\n`;

        if (info.affiliation.length) {
            caption += `\n*🏷️ Affiliation:*\n`;
            caption += info.affiliation.map(v => `• ${v}`).join("\n") + "\n";
        }

        if (info.profile) {
            caption += `\n*🧠 Profile:*\n${info.profile}\n`;
        }

        if (info.appearance) {
            caption += `\n*👗 Appearance:*\n${info.appearance}\n`;
        }

        if (info.images.length) {
            await conn.sendMessage(m.chat, {
                image: { url: info.images[0] },
                caption
            }, { quoted: m });
        } else {
            await m.reply(caption);
        }

    } catch (e) {
        await m.reply(`*🍂 GAGAL MENGAMBIL DATA*\nKarakter tidak ditemukan atau struktur wiki berubah`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['umachar'];
handler.tags = ['anime'];
handler.command = /^(umachar|umamusume)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;