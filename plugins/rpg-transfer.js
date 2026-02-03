export default async function handler(m, { args, usedPrefix, command }) {
    const { conn } = global;
    const items = {
        money: '💰money',
        limit: '🔋 limit ',
        bank: '🏦bank',
        potion: '🥤potion',
        trash: '🗑trash',
        wood: '🪵wood',
        rock: '🪨rock',
        string: '🕸️string',
        petFood: '🔖petFood',
        emerald: '❇️emerald',
        diamond: '💎diamond',
        gold: '🪙gold',
        iron: '⛓️iron',
        common: '📦common',
        uncommon: '📦uncommon',
        mythic: '🎁mythic',
        legendary: '🗃️legendary',
        pet: '🔖pet',
        anggur: '🍇anggur',
        apel: '🍎apel',
        jeruk: '🍊jeruk',
        mangga: '🥭mangga',
        pisang: '🍌pisang',
        bibitanggur: '🌱bibitanggur',
        bibitapel: '☘️bibitapel',
        bibitjeruk: '🌿bibitjeruk',
        bibitmangga: '🍀bibitmangga',
        bibitpisang: '🌴bibitpisang'
    };

    // Jika pengguna hanya mengetik .tf atau transfer tanpa argumen
    if (!args[0]) {
        return m.reply(
            `📍 *Daftar Item yang Bisa Ditransfer:*\n\n${Object.values(items).join('\n')}\n\n📌 *Cara Menggunakan:*\n- Ketik: \`${usedPrefix + command} <item> <jumlah> <@user>\`\n\nContoh:\n\`${usedPrefix + command} money 1000 @user\``
        );
    }

    let item = args[0];
    let amount = parseInt(args[1]);
    let mentionedUser = m.mentionedJid && m.mentionedJid[0];

    if (!items[item]) {
        return m.reply(`❌ Item tidak valid!\n\n📍 Item yang bisa ditransfer:\n${Object.values(items).join('\n')}`);
    }
    if (isNaN(amount) || amount <= 0) {
        return m.reply('❌ Jumlah harus berupa angka positif!');
    }
    if (!mentionedUser) {
        return m.reply('⚠️ Tag pengguna yang ingin kamu transfer!');
    }

    // Pastikan pengguna memiliki cukup item
    let senderData = global.db.data.users[m.sender];
    let receiverData = global.db.data.users[mentionedUser];

    if (!senderData[item] || senderData[item] < amount) {
        return m.reply(`⚠️ Kamu tidak memiliki cukup ${items[item]} untuk ditransfer!`);
    }

    // Transfer item
    senderData[item] -= amount;
    if (!receiverData[item]) receiverData[item] = 0;
    receiverData[item] += amount;

    m.reply(`✅ Berhasil mentransfer ${amount} ${items[item]} ke @${mentionedUser.split('@')[0]}! 🎉\n\n📦 *Rincian Transfer:*\n- Pengirim: @${m.sender.split('@')[0]}\n- Penerima: @${mentionedUser.split('@')[0]}\n- Jumlah: ${amount} ${items[item]}`, null, {
        mentions: [m.sender, mentionedUser]
    });
}

handler.tags = ['rpg'];
handler.command = /^(tf|transfer)$/i;
handler.help = ['tf <item> <jumlah> <@user>'];