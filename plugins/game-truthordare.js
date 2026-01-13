const handler = async (m, { conn, usedPrefix, args }) => {
  conn.todRooms = conn.todRooms || {};

  const truthQuestions = [
    "Apa rahasia terbesar yang pernah kamu simpan?",
    "Siapa yang pernah kamu suka diam-diam di sini?",
    "Kapan terakhir kali kamu menangis dan kenapa?",
    "Hal paling memalukan yang pernah terjadi pada dirimu?",
    "Pilih salah satu teman di grup ini yang ingin kamu ajak bicara lebih dekat."
  ];

  const dareChallenges = [
    "Kirim pesan cinta ke salah satu kontak di grup ini.",
    "Rekam dirimu bernyanyi lagu favorit dan kirim ke grup.",
    "Gunakan nama panggilan lucu di grup selama 24 jam.",
    "Berikan pujian tulus kepada 3 anggota grup secara acak.",
    "Ganti foto profilmu dengan gambar lucu selama 1 hari."
  ];

  switch (args[0]?.toLowerCase()) {
    case "create":
      if (conn.todRooms[m.chat]) {
        return m.reply('Room Truth or Dare sudah ada.');
      }
      conn.todRooms[m.chat] = {
        players: [],
        currentTurn: 0
      };
      m.reply('Room Truth or Dare berhasil dibuat. Pemain sekarang bisa bergabung (maksimal 5 pemain).');
      break;

    case "join":
      if (!conn.todRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .tod create untuk membuat room.');
      }
      const room = conn.todRooms[m.chat];
      if (room.players.length >= 5) {
        return m.reply('Room sudah penuh. Maksimal 5 pemain.');
      }
      if (room.players.find(p => p.id === m.sender)) {
        return m.reply('Kamu sudah bergabung di room.');
      }
      const playerName = m.pushName || conn.getName(m.sender);
      room.players.push({ id: m.sender, name: playerName });
      m.reply(`Kamu berhasil bergabung ke room. (${room.players.length}/5 pemain)`);
      break;

    case "start":
      if (!conn.todRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .tod create untuk membuat room.');
      }
      const startRoom = conn.todRooms[m.chat];
      if (startRoom.players.length < 2) {
        return m.reply('Minimal 2 pemain untuk memulai game.');
      }
      m.reply('Game Truth or Dare dimulai! Siapkan dirimu!');
      startRoom.currentTurn = Math.floor(Math.random() * startRoom.players.length);
      const currentPlayer = startRoom.players[startRoom.currentTurn];
      m.reply(`Sekarang giliran ${currentPlayer.name}. Ketik .tod truth atau .tod dare.`);
      break;

/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
    case "truth":
    case "dare":
      if (!conn.todRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .tod create untuk membuat room.');
      }
      const todRoom = conn.todRooms[m.chat];
      if (todRoom.players[todRoom.currentTurn].id !== m.sender) {
        return m.reply('Ini bukan giliranmu.');
      }

      if (args[0].toLowerCase() === "truth") {
        const randomTruth = truthQuestions[Math.floor(Math.random() * truthQuestions.length)];
        m.reply(`*Truth:* ${randomTruth}`);
      } else {
        const randomDare = dareChallenges[Math.floor(Math.random() * dareChallenges.length)];
        m.reply(`*Dare:* ${randomDare}`);
      }

      todRoom.currentTurn = (todRoom.currentTurn + 1) % todRoom.players.length;
      const nextPlayer = todRoom.players[todRoom.currentTurn];
      m.reply(`Sekarang giliran ${nextPlayer.name}. Ketik .tod truth atau .tod dare.`);
      break;

    case "players":
      if (!conn.todRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .tod create untuk membuat room.');
      }
      const playersList = conn.todRooms[m.chat].players;
      m.reply(`Pemain yang bergabung (${playersList.length}/5):\n${playersList.map(p => p.name).join('\n')}`);
      break;

    case "delete":
      if (!conn.todRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat.');
      }
      delete conn.todRooms[m.chat];
      m.reply('Room telah dihapus.');
      break;

    default:
      m.reply(`*❏ TRUTH OR DARE 🎭*

• ${usedPrefix}tod create (buat room)
• ${usedPrefix}tod join (bergabung ke room, max 5 pemain)
• ${usedPrefix}tod start (mulai game, min 2 pemain)
• ${usedPrefix}tod truth (pilih pertanyaan Truth)
• ${usedPrefix}tod dare (pilih tantangan Dare)
• ${usedPrefix}tod players (lihat daftar pemain)
• ${usedPrefix}tod delete (hapus sesi room)

Ayo bermain Truth or Dare!`);
  }
};

handler.help = ['truthordare', 'tod']
handler.tags = ['game']
handler.command = /^(truthordare|tod)$/i
handler.group = true
export default handler;