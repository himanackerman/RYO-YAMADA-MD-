/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Author     : Maxz Store
 * 📞 Contact    : +62 859-7427-8171
 * 📢 Channel    : https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i
 * ⚠️ Note       : Keep credit to respect the creator!
 * ─────────────────────────
 * 📝 Plugin: MLBB First Recharge / DM Ganda Checker
 */

import axios from "axios"

let handler = async (m, { args, usedPrefix, command }) => {
    if (args.length < 2) {
        return m.reply(`┌˚₊ ๑│ ᴍ ʟ ʙ ʙ   ᴄ ʜ ᴇ ᴄ ᴋ ᴇ ʀ │๑˚₊ 🎮\n┇ \n│ ❌ *Input kurang lengkap cuy!*\n│ \n│ 📌 *Cara pakai:*\n│ ${usedPrefix + command} 12345678 123\n│ \n│ 📝 *Contoh:*\n│ ${usedPrefix + command} 987654321 2345\n┇ \n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`)
    }

    const [uid, zone] = args

    await m.react("⏳")

    try {
        const { data } = await axios.get(
            "https://api.mobapay.com/api/app_shop",
            {
                headers: {
                    "content-type": "application/json",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                params: {
                    app_id: 100000,
                    game_user_key: uid,
                    game_server_key: zone,
                    country: "ID",
                    language: "en",
                    shop_id: 1001
                },
                timeout: 15000
            }
        )

        const shop = data?.data?.shop_info
        const user = data?.data?.user_info

        if (!shop || !user) throw new Error("Data akun atau zona tidak valid / Server Maintenance.")

        const parseGoods = (goods) =>
            goods
                .filter(v => v.label && v.label.caption === "首充商品角标")
                .map(v => ({
                    title: v.title,
                    available: !v.goods_limit?.reached_limit
                }))

        const firstRecharge = [
            ...parseGoods(shop.good_list || []),
            ...parseGoods(shop.shelf_location?.[0]?.goods || [])
        ]

        if (!firstRecharge.length) {
            await m.react("❌")
            return m.reply(`┌˚₊ ๑│ ᴍ ʟ ʙ ʙ   ᴄ ʜ ᴇ ᴄ ᴋ ᴇ ʀ │๑˚₊ 🎮\n┇ \n│ ❌ *Promo First Recharge Tidak Ditemukan.*\n│ Akun ini kemungkinan sudah mengambil semua bonus event.\n┇ \n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`)
        }

        let listHasil = ""
        firstRecharge.forEach((v, i) => {
            listHasil += `│   ${i + 1}. ${v.title}\n│      *Status:* ${v.available ? "✅ Tersedia" : "❌ Sudah Dibeli"}\n│\n`
        })

        let caption = `┌˚₊ ๑│ ᴍ ʟ ʙ ʙ   ᴄ ʜ ᴇ ᴄ ᴋ ᴇ ʀ │๑˚₊ 🎮\n┇ \n` +
                      `│ 👤 *Username:* ${user.user_name || "-"}\n` +
                      `│ 🆔 *User ID:* ${uid}\n` +
                      `│ 🌐 *Zone ID:* ${zone}\n` +
                      `┇ \n` +
                      `│ 💎 *Status Event DM Ganda:*\n` +
                      listHasil +
                      `└˚₊ ๑ ────────────── ๑˚₊\n` +
                      `> © ERINE-AI`

        await m.reply(caption.trim())
        await m.react("✅")

    } catch (e) {
        console.error('[MLBB CEK DM GANDA ERROR]', e)
        await m.react("❌")
        m.reply(`┌˚₊ ๑│ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ   ᴇ ʀ ʀ ᴏ ʀ │๑˚₊ ❌\n┇ Gagal melakukan pengecekan akun.\n┇ *Detail:* ${e.message || e}\n└˚₊ ๑ ────────────── ๑˚₊\n> © ERINE-AI`)
    }
}

handler.help = ["cekdmganda <uid> <zone>"]
handler.tags = ["stalk"]
handler.command = /^(cekdmganda|cekdm|dmganda)$/i
handler.limit = true

export default handler