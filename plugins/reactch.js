let handler = async (m, { text, conn, usedPrefix, command }) => {
    const args = text.trim().split(/ +/);
    if (args.length < 3) return m.reply("Format salah! Gunakan: .reactch <idsaluran> <message_id> <emoji>");

    const channelId = args[0];
    const messageId = args[1];
    const emoji = args[2];

    try {
        await conn.newsletterReactMessage(channelId, messageId, emoji);
        m.reply(`Berhasil mengirim reaksi ${emoji} ke pesan dengan ID ${messageId} di saluran ${channelId}.`);
    } catch (error) {
        console.error("Gagal mengirim reaksi:", error);
        m.reply("Gagal mengirim reaksi. Pastikan ID saluran dan pesan benar.");
    }
}

handler.help = ['reactch'].map(v => v + ' <idsaluran> <message_id> <emoji>');
handler.tags = ['owner', 'premium'];
handler.command = /^(reactch)$/i;
handler.premium = true

export default handler;