const handler = async (m, { conn }) => {
  conn.koboy = conn.koboy || {};

  if (conn.koboy[m.chat]) {
    return m.reply('⚠️ Kamu sedang bermain game *Koboy*! Tunggu 20 menit lagi untuk memulai lagi.');
  }

  let user = global.db.data.users[m.sender];
  if (user.lastKoboy && (new Date - user.lastKoboy) < 1000 * 60 * 20) {
    let d = new Date(new Date - user.lastKoboy);
    let s = Math.floor(1200 - d / 1000);
    return m.reply(`⏳ Tunggu *${s} detik lagi* untuk memulai permainan *Koboy* lagi.`);
  }

  let playerPosition, criminalPosition;
  do {
    playerPosition = Math.floor(Math.random() * 6);
    criminalPosition = Math.floor(Math.random() * 6);
  } while (playerPosition === criminalPosition);

  let gameState = `🎯 *Game Koboy: Kejar Penjahat!*

🏇 Posisi kamu:
${"・".repeat(playerPosition)}🤠${"・".repeat(5 - playerPosition)}
🚨 Posisi penjahat:
${"・".repeat(criminalPosition)}🥷${"・".repeat(5 - criminalPosition)}

➡️ Ketik *'kanan'* untuk bergerak ke kanan.
⬅️ Ketik *'kiri'* untuk bergerak ke kiri.

⚠️ Kamu punya *5 langkah* untuk menangkap penjahat!`;

  let { key } = await conn.reply(m.chat, gameState, m);

  conn.koboy[m.chat] = {
    playerPosition,
    criminalPosition,
    key,
    oldkey: key,
    earnedExp: 10000,
    earnedMoney: 1000000,
    sender: m.sender,
    moveCount: 0,
    maxMoves: 5,
    roomId: m.chat,
  };

  user.lastKoboy = new Date * 1;
  db.data.users[m.sender] = user;
};

handler.before = async (m, { conn }) => {
  conn.koboy = conn.koboy || {};
  let user = global.db.data.users[m.sender];
  if (!conn.koboy[m.chat] || conn.koboy[m.chat].roomId !== m.chat || !['kiri', 'kanan'].includes(m.text.toLowerCase())) return;

  let gameData = conn.koboy[m.chat];
  let { playerPosition, criminalPosition, key, oldkey, moveCount, maxMoves, earnedExp, earnedMoney, sender } = gameData;

  if (m.quoted || m.quoted.id == key) {
    if (m.text.toLowerCase() === 'kiri') {
      if (playerPosition > 0) {
        playerPosition--;
        moveCount++;
      } else {
        return m.reply('🚫 Kamu sudah berada di batas paling kiri!');
      }
    } else if (m.text.toLowerCase() === 'kanan') {
      if (playerPosition < 5) {
        playerPosition++;
        moveCount++;
      } else {
        return m.reply('🚫 Kamu sudah berada di batas paling kanan!');
      }
    }

    if (playerPosition === criminalPosition) {
      conn.sendMessage(m.chat, { delete: oldkey });
      let earnedMoneys = randomMoney(earnedMoney, 1);
      let earnedExps = randomMoney(earnedExp, 1);
      user.money = (user.money || 0) + earnedMoneys;
      user.exp = (user.exp || 0) + earnedExps;
      delete conn.koboy[m.chat];
      return conn.reply(
        m.chat,
        `🎉 *Selamat! Kamu berhasil menangkap penjahat!*\n\n💰 Uang yang didapat: *${formatRupiah(earnedMoneys)}*\n🔼 EXP yang didapat: *${earnedExps}*\n`,
        m,
        { mentions: [sender] }
      );
    } else if (moveCount === maxMoves) {
      conn.sendMessage(m.chat, { delete: oldkey });
      delete conn.koboy[m.chat];
      return conn.reply(
        m.chat,
        `😔 *Kamu kalah!* Penjahat berhasil melarikan diri karena kamu sudah menggunakan semua langkah.`,
        m,
        { mentions: [sender] }
      );
    }

    let gameState = `🎯 *Game Koboy: Kejar Penjahat!*

🏇 Posisi kamu:
${"・".repeat(playerPosition)}🤠${"・".repeat(5 - playerPosition)}
🚨 Posisi penjahat:
${"・".repeat(criminalPosition)}🥷${"・".repeat(5 - criminalPosition)}

➡️ Reply *'kanan'* untuk bergerak ke kanan.
⬅️ Reply *'kiri'* untuk bergerak ke kiri.

⚠️ Langkah tersisa: *${maxMoves - moveCount}*`;

    let msg = await conn.reply(m.chat, gameState, null);

    conn.koboy[m.chat] = {
      ...gameData,
      playerPosition,
      moveCount,
      key: msg,
    };
  }
};

handler.help = ['koboy'];
handler.tags = ['rpg'];
handler.command = /^(koboy)$/i;
handler.disabled = false;

export default handler;

function randomMoney(max, min) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRupiah(number) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  });

  return formatter.format(number);
}