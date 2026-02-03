/**
 ╔══════════════════════
      ⧉  [market] — [info]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ API     : https://zelapioffciall.koyeb.app
  ✺ Note    : .market (buat menampilkan top 1-10) .market 11 atau 250 (buat nunjukin posisi market dengan rank 11 itu apa sampe seterusnya)
*/

let handler = async (m, { conn, text }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let res = await fetch("https://zelapioffciall.koyeb.app/live/market");
        if (!res.ok) throw new Error("Fetch failed");

        let json = await res.json();
        if (!json.status || !Array.isArray(json.data)) throw new Error("Invalid response");

        let output = `*📈 MARKET CRYPTO UPDATE*\n`;
        output += `*🌍 Total Market:* ${json.total}\n\n`;

        let data;

        if (!text) {
            data = json.data.slice(0, 10);
        } else {
            let rank = parseInt(text);
            if (isNaN(rank) || rank < 1)
                throw new Error("Invalid rank");

            data = json.data.filter(v => v.market_cap_rank === rank);
            if (!data.length)
                return m.reply(`🍂 *Market rank #${rank} tidak ditemukan.*`);
        }

        for (let c of data) {
            let trend =
                c.price_change_percentage_24h > 0 ? "🟢" :
                c.price_change_percentage_24h < 0 ? "🔴" : "⚪";

            output += `*#${c.market_cap_rank} ${c.name} (${c.symbol})*\n`;
            output += `💰 *Harga:* $${c.current_price}\n`;
            output += `${trend} *24 Jam:* ${c.price_change_percentage_24h.toFixed(2)}%\n`;
            output += `🏦 *Market Cap:* $${c.market_cap.toLocaleString()}\n`;
            output += `🔄 *Volume:* $${c.total_volume.toLocaleString()}\n`;
            output += `📦 *Supply:* ${c.circulating_supply.toLocaleString()}\n\n`;
        }

        output += `✨ *Update terakhir:* ${new Date(json.data[0].last_updated).toLocaleString()}`;

        await conn.sendMessage(
            m.chat,
            {
                text: output,
                contextInfo: {
                    externalAdReply: {
                        title: "Market Crypto Update",
                        body: "Realtime Global Crypto Market",
                        mediaType: 1,
                        thumbnailUrl: "https://files.cloudkuimages.guru/images/9f291dfe14a8.jpg",
                        renderLargerThumbnail: true,
                        sourceUrl: "https://zelapioffciall.koyeb.app/live/market"
                    }
                }
            },
            { quoted: m }
        );
    } catch (e) {
        await m.reply(`🍂 *Gagal mengambil data market crypto.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.help = ["market"];
handler.tags = ["info"];
handler.command = /^(market)$/i;
handler.limit = true;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;