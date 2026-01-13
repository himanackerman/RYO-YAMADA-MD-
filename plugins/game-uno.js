/*

# Fitur : Uno Game
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : Offline logic

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/
let Fruatre = async (m, { conn, args, command, usedPrefix }) => {
    const chatId = m.chat;
    const playerId = m.sender;
    const action = args[0]?.toLowerCase();
    global.games = global.games || {};

    if (!action) {
        return m.reply(`
🎮 *Panduan Bermain Uno* 🎮
➤ *${usedPrefix}uno start* - Memulai permainan Uno baru.
➤ *${usedPrefix}uno join* - Bergabung dengan permainan Uno yang sedang berlangsung.
➤ *${usedPrefix}uno play <nomor_kartu>* - Memainkan kartu tertentu dari tangan Anda.
➤ *${usedPrefix}uno draw* - Mengambil kartu dari dek.
➤ *${usedPrefix}uno status* - Melihat status permainan saat ini.
➤ *${usedPrefix}uno delete* - Menghapus permainan saat ini.
➤ *${usedPrefix}uno viewcard* - Melihat list kartu ini.

🎯 *Tujuan*: Jadi pemain pertama yang menghabiskan semua kartu!
        `);
    }

    if (action === 'start') {
        if (global.games[chatId]) {
            return m.reply("🚫 Permainan sudah dimulai. Bergabunglah atau tunggu hingga selesai.");
        }
        global.games[chatId] = {
            deck: createDeck(),
            players: [playerId],
            hands: {},
            turn: 0,
            currentCard: drawCard(createDeck()),
            direction: 1,
            creator: playerId,
            status: 'waiting'
        };
        global.games[chatId].hands[playerId] = drawCards(global.games[chatId].deck, 7);
        await conn.reply(chatId, `🎮 *UNO GAME DIMULAI!*\n👤 Pemain 1: @${playerId.split('@')[0]}\n🃏 Kartu pertama: ${cardToString(global.games[chatId].currentCard)}\n\nKetik *${usedPrefix}uno join* untuk bergabung.\n\n⏳ *Permainan akan otomatis dimulai jika jumlah pemain mencapai 4 orang.*`, null, { mentions: [playerId] });
        return;
    }

    const game = global.games[chatId];

    if (action === 'join') {
        if (!game || game.status !== 'waiting') return m.reply("🚫 Tidak ada permainan yang menunggu. Gunakan *!uno start* untuk membuat permainan baru.");
        if (game.players.includes(playerId)) return m.reply("🚫 Anda sudah bergabung.");
        if (game.players.length >= 4) return m.reply("🚫 Permainan penuh (maksimal 4 pemain).");
        game.players.push(playerId);
        game.hands[playerId] = drawCards(game.deck, 7);
        await m.reply(`✅ @${playerId.split('@')[0]} bergabung dalam permainan Uno!\n🃏 Anda memiliki ${game.hands[playerId].length} kartu.`);
        if (game.players.length === 4){
           game.status = 'playing';
           await m.reply("🎉 Jumlah pemain telah tercukupi dan permainan telah dimulai!\nKetik *.uno play <id kartu>* sesuai giliran!");
           await showGameState(chatId, conn);
        }
        return;
    }

    if (game.status !== 'playing') return m.reply("🚫 Permainan belum dimulai atau status tidak valid.");
    if (game.players[game.turn] !== playerId) return m.reply("⛔ Bukan giliran Anda!");

    if (action === 'draw') {
        const card = drawCard(game.deck);
        game.hands[playerId].push(card);
        m.reply(`📥 Anda menarik kartu: ${cardToString(card)}`);
        game.turn = nextTurn(game);
        await showGameState(chatId, conn);
        return;
    }

    if (action === 'play') {
        const hand = game.hands[playerId];
        const cardIndex = parseInt(args[1]) - 1;
        if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= hand.length) return m.reply("🚫 Nomor kartu tidak valid.");

        const card = hand[cardIndex];
        if (!isPlayable(card, game.currentCard)) return m.reply("🚫 Anda tidak bisa memainkan kartu itu.");

        game.currentCard = card;
        hand.splice(cardIndex, 1);
        if (hand.length === 0) {
            delete global.games[chatId];
            return m.reply(`🏆 Selamat @${playerId.split('@')[0]}, Anda memenangkan permainan Uno!`, null, { mentions: [playerId] });
        }

        game.turn = nextTurn(game);
        await showGameState(chatId, conn);
        return;
    }

    if (action === 'viewcard') {
        let card = "🃏 *Kartu Anda*\n\n[ID] COLOR VALUE\n";
        let h = game.hands[playerId];
        for(let i = 0; i < h.length; i++){
          card += `\n[${i + 1}] ${colorEmoji(h[i].color)} ${h[i].color} ${h[i].value}`;
        }
        await conn.sendMessage(playerId, { text: card }, { quoted: m });
        m.reply("_🕵️ Kartu Anda telah dikirim via chat pribadi!_");
        return;
    }

    if (action === 'delete') {
        if (game.creator !== playerId) return m.reply("🚫 Hanya pembuat game yang bisa menghapus permainan.");
        delete global.games[chatId];
        m.reply("🗑️ Permainan Uno berhasil dihapus.");
        return;
    }

    if (action === 'status') {
        await showGameState(chatId, conn);
        return;
    }
};

// Fungsi Pembantu
const createDeck = () => {
    const colors = ["merah", "kuning", "hijau", "biru"];
    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"];
    let deck = [];

    colors.forEach(color => {
        values.forEach(value => {
            deck.push({ color, value });
            if (value !== "0") deck.push({ color, value });
        });
    });
    for (let i = 0; i < 4; i++) deck.push({ color: "wild", value: "wild" });
    for (let i = 0; i < 4; i++) deck.push({ color: "wild", value: "draw4" });

    return deck.sort(() => Math.random() - 0.5);
};

const drawCard = deck => deck.pop();
const drawCards = (deck, count) => Array.from({ length: count }, () => drawCard(deck));
const nextTurn = game => (game.turn + game.direction + game.players.length) % game.players.length;
const cardToString = card => card.color === 'wild' ? `🌈 ${card.value.toUpperCase()}` : `${colorEmoji(card.color)} ${card.color} ${card.value}`;
const isPlayable = (card, currentCard) => card.color === currentCard.color || card.value === currentCard.value || card.color === 'wild';

const colorEmoji = color => {
  return {
    merah: '🟥',
    kuning: '🟨',
    hijau: '🟩',
    biru: '🟦',
    wild: '🌈'
  }[color] || '';
};

const showGameState = async (chatId, conn) => {
    const game = global.games[chatId];
    let stateMessage = `🃏 *Kartu Saat Ini:* ${cardToString(game.currentCard)}\n\n`;

    game.players.forEach((id, i) => {
        stateMessage += `${i === game.turn ? '➡️ ' : ''}@${id.split('@')[0]} (${game.hands[id].length} kartu)\n`;
    });

    stateMessage += `\n🧐 *Lihat kartu Anda:*\n- .uno viewcard\n_Bot akan mengirimkan daftar kartu via PM._\n\n💡 *Tidak bisa main?* Ketik *.uno draw* untuk mengambil kartu baru.`;

    await conn.reply(chatId, stateMessage, null, { mentions: game.players });
};

Fruatre.help = ['uno'];
Fruatre.tags = ['game'];
Fruatre.command = /^(uno)$/i;
Fruatre.group = false;

export default Fruatre;