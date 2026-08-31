/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
const TARUHAN = 50000

const Fruatre = async (m, { conn, usedPrefix, args, command }) => {
  const user = global.db.data.users[m.sender]

  conn.jbRooms = conn.jbRooms || {};
  conn.jbVotes = conn.jbVotes || {};
  conn.jbVotes[m.chat] = conn.jbVotes[m.chat] || {};

  const clubs = [
    "Real Madrid", "Manchester United", "Inter Milan", "Barcelona",
    "Liverpool", "Paris Saint-Germain", "Chelsea", "Juventus",
    "Borussia Dortmund", "Atletico Madrid", "RB Leipzig", "Porto",
    "Arsenal", "Shakhtar Donetsk", "Red Bull Salzburg", "AC Milan",
    "Braga", "PSV Eindhoven", "Lazio", "Red Star Belgrade", "FC Copenhagen"
  ];

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const countVotes = (votes) => {
    const voteCount = { "1": 0, "2": 0 };
    Object.values(votes).forEach(vote => {
      if (voteCount[vote] !== undefined) {
        voteCount[vote]++;
      }
    });
    return voteCount;
  };

  if (!args[0] || args[0] === "help") {
    const message = `*❏ JUDI BOLA⚽*

• ${usedPrefix}jb create (buat room)
• ${usedPrefix}jb join (player join, taruhan Rp${TARUHAN.toLocaleString()})
• ${usedPrefix}jb player (daftar pemain yang bergabung)
• ${usedPrefix}jb mulai (mulai game)
• ${usedPrefix}jb vote 1/2 (vote klub pilihan)
• ${usedPrefix}jb delete (hapus sesi room game)

Buatkan sebuah permainan tebak pertandingan bola, contoh: 1 Braga vs 2 Lazio

Untuk pilihan, gunakan ${usedPrefix}jb vote 1 atau 2

Minimal player yang bergabung untuk memulai game adalah 2 pemain.

Taruhan: Rp${TARUHAN.toLocaleString()} per orang
Hadiah: seluruh pool taruhan dibagi rata ke pemenang`;
    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReplyOffOffOff: {
          title: 'RYO YAMADA - MD',
          body: 'Ayo ikut dan menangkan hadiahnya!',
          thumbnailUrl: 'https://telegra.ph/file/3463760976052aeac5f21.jpg',
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
    return;
  }

  switch (args[0].toLowerCase()) {
    case 'create':
      if (conn.jbRooms[m.chat]) {
        return m.reply('Room sudah ada.');
      }
      conn.jbRooms[m.chat] = {
        players: [],
        gameStarted: false,
        clubs: [],
        bank: 0
      };
      m.reply('Room berhasil dibuat. Pemain sekarang bisa bergabung.');
      break;

    case 'join': {
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .jb create untuk membuat room.');
      }
      if (conn.jbRooms[m.chat].gameStarted) {
        return m.reply('Game sudah dimulai. Tidak bisa bergabung sekarang.');
      }
      if (conn.jbRooms[m.chat].players.find(p => p.id === m.sender)) {
        return m.reply('Anda sudah bergabung di room.');
      }
      if (user.money < TARUHAN) {
        return m.reply(`Uang Anda tidak cukup untuk memasang taruhan sebesar Rp${TARUHAN.toLocaleString()}.`);
      }
      user.money -= TARUHAN
      const playerName = m.pushName || conn.getName(m.sender);
      conn.jbRooms[m.chat].players.push({ id: m.sender, name: playerName });
      conn.jbRooms[m.chat].bank += TARUHAN;
      m.reply(`Anda berhasil bergabung di room. Anda telah memasang taruhan sebesar Rp${TARUHAN.toLocaleString()}. Total pool taruhan: Rp${conn.jbRooms[m.chat].bank.toLocaleString()}`);
      break;
    }

    case 'player': {
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .jb create untuk membuat room.');
      }
      const players = conn.jbRooms[m.chat].players;
      m.reply(`Pemain yang bergabung: \n${players.map(p => `${p.name} (${p.id})`).join('\n')}`);
      break;
    }

    case 'mulai':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .jb create untuk membuat room.');
      }
      if (conn.jbRooms[m.chat].players.length < 2) {
        return m.reply('Minimal 2 pemain untuk memulai game.');
      }
      shuffleArray(clubs);
      conn.jbRooms[m.chat].clubs = [clubs[0], clubs[1]];
      conn.jbRooms[m.chat].gameStarted = true;
      m.reply(`Game dimulai! Pertandingan: 1 ${clubs[0]} vs 2 ${clubs[1]}. Silakan vote klub pilihan Anda.`);
      break;

    case 'vote': {
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat. Gunakan .jb create untuk membuat room.');
      }
      if (!conn.jbRooms[m.chat].gameStarted) {
        return m.reply('Game belum dimulai. Gunakan .jb mulai untuk memulai game.');
      }
      if (!args[1] || !['1', '2'].includes(args[1])) {
        return m.reply('Pilihan tidak valid. Gunakan .jb vote 1 atau 2.');
      }
      const vote = args[1];
      const currentRoom = conn.jbRooms[m.chat];
      const player = currentRoom.players.find(p => p.id === m.sender);
      if (!player) {
        return m.reply('Anda belum bergabung dalam room.');
      }
      conn.jbVotes[m.chat][m.sender] = vote;
      m.reply(`Anda memilih klub nomor ${vote}.`);

      const roomVotes = conn.jbVotes[m.chat];
      const voteCount = countVotes(roomVotes);
      if (Object.keys(roomVotes).length === currentRoom.players.length) {
        m.reply('Semua pemain telah vote. Pertandingan akan segera dimulai...');

        setTimeout(() => {
          m.reply('Pertandingan telah dimulai. Mohon tunggu sampai pertandingan selesai...');

          setTimeout(() => {
            const winnerVote = voteCount["1"] > voteCount["2"] ? "1" : (voteCount["2"] > voteCount["1"] ? "2" : null);

            if (!winnerVote) {
              m.reply(`Pertandingan berakhir seri di voting. Taruhan dikembalikan ke semua pemain.`);
              for (const p of currentRoom.players) {
                if (global.db.data.users[p.id]) {
                  global.db.data.users[p.id].money += TARUHAN;
                }
              }
              delete conn.jbRooms[m.chat];
              delete conn.jbVotes[m.chat];
              return;
            }

            const winningClub = currentRoom.clubs[winnerVote - 1];
            const winners = currentRoom.players.filter(p => roomVotes[p.id] === winnerVote);

            if (winners.length > 0) {
              const rewardPerWinner = Math.floor(currentRoom.bank / winners.length);
              for (const w of winners) {
                if (global.db.data.users[w.id]) {
                  global.db.data.users[w.id].money += rewardPerWinner;
                }
              }
              m.reply(`Pertandingan telah selesai.\nPemenang adalah ${winningClub}.\nPemain yang memilih ${winningClub}:\n${winners.map(w => w.name).join('\n')}\n\nSelamat! Setiap pemenang mendapatkan Rp${rewardPerWinner.toLocaleString()} dari total pool Rp${currentRoom.bank.toLocaleString()}.`);
            } else {
              m.reply(`Pertandingan telah selesai.\nPemenang adalah ${winningClub}, tapi tidak ada yang memilih klub tersebut. Pool taruhan hangus.`);
            }

            delete conn.jbRooms[m.chat];
            delete conn.jbVotes[m.chat];
          }, 25000);
        }, 25000);
      }
      break;
    }

    case 'delete':
      if (!conn.jbRooms[m.chat]) {
        return m.reply('Belum ada room yang dibuat.');
      }
      delete conn.jbRooms[m.chat];
      delete conn.jbVotes[m.chat];
      m.reply('Room telah dihapus.');
      break;

    default:
      m.reply('Perintah tidak dikenal. Gunakan .jb help untuk melihat daftar perintah.');
  }
};

Fruatre.help = ['judibola']
Fruatre.tags = ['rpg']
Fruatre.command = /^(judibola|jb)$/i
Fruatre.group = true
Fruatre.register = true
export default Fruatre;