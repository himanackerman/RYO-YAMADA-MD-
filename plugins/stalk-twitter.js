/**
 ╔══════════════════════
      ⧉  [twitterstalk] — [tools]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Scrape      : 
  [ https://gist.github.com/ZenzzXD/001f8f53090e83f9a3d6f6eb9d649aa8 ]
  [ https://whatsapp.com/channel/0029Vap84RE8KMqfYnd0V41A/3425 ]
  ✺ Scrape Maker : [ Zenz ]
*/

import crypto from "crypto";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} mrbeast`);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const username = text.replace(/^@/, "").trim();

        const chRes = await fetch("https://twittermedia.b-cdn.net/challenge/", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
                "Accept": "application/json",
                "Origin": "https://snaplytics.io",
                "Referer": "https://snaplytics.io/"
            }
        });

        const ch = await chRes.json();
        if (!ch.challenge_id) throw new Error("Challenge gagal");

        const hash = crypto
            .createHash("sha256")
            .update(String(ch.timestamp) + ch.random_value)
            .digest("hex")
            .slice(0, 8);

        const dataRes = await fetch(
            `https://twittermedia.b-cdn.net/viewer/?data=${encodeURIComponent(username)}&type=profile`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
                    "Accept": "application/json",
                    "Origin": "https://snaplytics.io",
                    "Referer": "https://snaplytics.io/",
                    "X-Challenge-ID": ch.challenge_id,
                    "X-Challenge-Solution": hash
                }
            }
        );

        const json = await dataRes.json();
        if (!json || !json.profile) throw new Error("Data tidak ditemukan");

        const p = json.profile;

        let caption = `
🧭 *Hasil Pelacakan Profil X*

👤 *Nama Pengguna:* ${p.name || "Tidak Ditemukan"}
🔖 *Username / Handle:* @${username}
${p.verified ? "✅ *Akun Terverifikasi*" : "❌ *Akun Tidak Terverifikasi*"}
📝 *Bio / Deskripsi:*
${p.bio ? `"${p.bio}"` : "(Tidak ada bio)"}

📊 *Statistik Akun*
━━━━━━━━━━━━━━━━━━
📈 *Jumlah Postingan:* ${p.stats?.tweets ?? 0}
👁️ *Sedang Mengikuti:* ${p.stats?.following ?? 0}
⭐ *Jumlah Pengikut:* ${p.stats?.followers ?? 0}
━━━━━━━━━━━━━━━━━━

📌 *Catatan:* Data ini diambil pada ${new Date().toLocaleDateString("id-ID")}.
`.trim();

        if (p.banner_url) {
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: p.banner_url },
                    caption
                },
                { quoted: m }
            );
        } else if (p.avatar_url) {
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: p.avatar_url },
                    caption
                },
                { quoted: m }
            );
        } else {
            await m.reply(caption);
        }
    } catch (e) {
        await m.reply(`🍂 *Gagal mengambil data Twitter*\n\n📩 ${e.message}`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.help = ["twitterstalk"];
handler.tags = ["stalk"];
handler.command = /^(twitterstalk|twstalk)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;