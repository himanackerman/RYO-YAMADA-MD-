let handler = async (m, { text, usedPrefix, command }) => {
    let who = m.sender;
    const user = global.db.data.users[who];

    if (user.tiktok && user.tiktok.username) {
        return m.reply('❌ Anda sudah memiliki akun TikTok! Gunakan perintah *.akuntt* untuk melihat profil Anda.');
    }

    if (!text) {
        return m.reply(`❗ Nama pengguna tidak boleh kosong.\nGunakan contoh: *${usedPrefix + command} NamaTikTok*`);
    }

    user.tiktok = {
        username: text.trim(),
        followers: 0,
        following: 0,
        likes: 0,
        posts: 0,
        views: 0,
        live: false,
        lastLive: 0,
    };

    m.reply(`
🎉 **Akun TikTok Berhasil Dibuat!**

👤 Username: ${user.tiktok.username}
👥 Followers: 0
❤️ Likes: 0
🎥 Views: 0
📁 Posts: 0
`);
};

handler.help = ['creatett <username>'];
handler.tags = ['rpg'];
handler.command = /^(creatett)$/i;

export default handler;