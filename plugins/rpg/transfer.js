let handler = async (m, { conn, args, usedPrefix, command }) => {
    const items = {
        money: '💰 Money',
        limit: '🌌 Limit',
        bank: '🏦 Bank',

        potion: '🥤 Potion',
        petfood: '🍖 Pet Food',
        umpan: '🪱 Umpan',

        trash: '🗑️ Trash',
        wood: '🪵 Wood',
        rock: '🪨 Rock',
        string: '🕸️ String',
        iron: '⛓️ Iron',

        emerald: '💚 Emerald',
        diamond: '💎 Diamond',
        gold: '👑 Gold',

        common: '📦 Common Crate',
        uncommon: '🎁 Uncommon Crate',
        mythic: '🗳️ Mythic Crate',
        legendary: '🗃️ Legendary Crate',

        pet: '🎟️ Pet Token',

        apel: '🍎 Apel',
        anggur: '🍇 Anggur',
        jeruk: '🍊 Jeruk',
        mangga: '🥭 Mangga',
        pisang: '🍌 Pisang',

        bibitapel: '🌱 Bibit Apel',
        bibitanggur: '🌱 Bibit Anggur',
        bibitjeruk: '🌱 Bibit Jeruk',
        bibitmangga: '🌱 Bibit Mangga',
        bibitpisang: '🌱 Bibit Pisang'
    }

    if (!args[0]) {
        return m.reply(`
📦 *ITEM YANG BISA DITRANSFER*

${Object.entries(items)
.map(([key, value]) => `• ${key} → ${value}`)
.join('\n')}

📌 *Contoh:*
${usedPrefix + command} money 10000 @tag
${usedPrefix + command} diamond 5 @tag
${usedPrefix + command} potion 10 @tag
${usedPrefix + command} apel 50 @tag
`.trim())
    }

    const item = args[0].toLowerCase()
    const amount = parseInt(args[1])

    const who = m.mentionedJid?.[0] ||
        m.quoted?.sender

    if (!items[item]) {
        return m.reply(
            `❌ Item tidak valid!\n\n` +
            Object.keys(items).join(', ')
        )
    }

    if (isNaN(amount) || amount < 1) {
        return m.reply('❌ Jumlah harus berupa angka dan minimal 1.')
    }

    if (!who) {
        return m.reply(
            `Tag atau reply target.\n\nContoh:\n${usedPrefix + command} money 10000 @tag`
        )
    }

    if (who === m.sender) {
        return m.reply('❌ Tidak bisa transfer ke diri sendiri.')
    }

    let senderData = global.db.data.users[m.sender]
    let receiverData = global.db.data.users[who]

    if (!receiverData) {
        return m.reply('❌ User tidak ditemukan di database.')
    }

    if ((senderData[item] || 0) < amount) {
        return m.reply(
            `⚠️ ${items[item]} kamu tidak cukup.\n\n` +
            `📦 Stok: ${senderData[item] || 0}\n` +
            `📤 Transfer: ${amount}`
        )
    }

    senderData[item] -= amount
    receiverData[item] = (receiverData[item] || 0) + amount

    conn.reply(
        m.chat,
        `
✅ *TRANSFER BERHASIL*

📦 Item : ${items[item]}
📤 Jumlah : ${amount}

👤 Pengirim : @${m.sender.split('@')[0]}
👥 Penerima : @${who.split('@')[0]}
        `.trim(),
        m,
        {
            mentions: [m.sender, who]
        }
    )
}

handler.help = ['tf <item> <jumlah> @user']
handler.tags = ['rpg']
handler.command = /^(tf|transfer)$/i
handler.rpg = true

export default handler