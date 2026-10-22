/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
let Fruatre = async (m, { conn, usedPrefix, command, text }) => {
    if (!conn.soccer) conn.soccer = {};

    const userId = m.sender;

    if (!conn.soccer[userId]) {
        conn.soccer[userId] = {
            score: 0,
            opponentScore: 0,
            team: null,
            opponentTeam: null,
            player: null,
            opponentPlayer: null,
            tactic: null,
            stamina: 100,
            gameTime: 0,
            matchLog: [],
            hasWon: false,
        };
        
        return m.reply(`
🏟️ *Selamat datang di Pertandingan Sepak Bola Virtual!*

🎮 Pilih Tim:
1. Barcelona
2. Real Madrid
3. Manchester United
4. Liverpool

Contoh: *${usedPrefix + command} Barcelona*
        `);
    }

    const playerData = conn.soccer[userId];
    const teams = {
        Barcelona: ['Messi', 'Xavi', 'Iniesta'],
        RealMadrid: ['Ronaldo', 'Benzema', 'Modric'],
        'Manchester United': ['Rashford', 'Fernandes', 'Maguire'],
        Liverpool: ['Salah', 'Mane', 'Van Dijk']
    };

    const normalizeText = (str = '') => str.trim().toLowerCase();

    const findKeyIgnoreCase = (obj, input) => {
        const target = normalizeText(input);
        return Object.keys(obj).find(key => normalizeText(key) === target);
    };

    if (!playerData.team) {
        const selectedTeam = findKeyIgnoreCase(teams, text);
        if (!text || !selectedTeam) {
            return m.reply('Pilih tim dengan mengetik nama tim: Barcelona, Real Madrid, Manchester United, Liverpool');
        }
        playerData.team = selectedTeam;
        playerData.player = teams[selectedTeam][Math.floor(Math.random() * teams[selectedTeam].length)];
        const opponents = Object.keys(teams).filter(t => t !== selectedTeam);
        playerData.opponentTeam = opponents[Math.floor(Math.random() * opponents.length)];
        playerData.opponentPlayer = teams[playerData.opponentTeam][Math.floor(Math.random() * teams[playerData.opponentTeam].length)];

        return m.reply(`Kamu memilih *${playerData.team}* dengan pemain *${playerData.player}* melawan *${playerData.opponentTeam}* dengan pemain *${playerData.opponentPlayer}*. Pertandingan dimulai!`);
    }

    const validTactics = ['Serangan', 'Pertahanan', 'Seimbang'];
    if (!playerData.tactic) {
        const selectedTactic = validTactics.find(t => normalizeText(t) === normalizeText(text));
        if (!text || !selectedTactic) {
            return m.reply('Taktik tidak valid! Pilih dari: Serangan, Pertahanan, Seimbang');
        }
        playerData.tactic = selectedTactic;
        return m.reply(`Taktik kamu sudah dipilih: *${playerData.tactic}*`);
    }

    playerData.gameTime += 10;
    playerData.stamina -= 10;
    if (playerData.stamina < 0) playerData.stamina = 0;

    let matchEvent = Math.random();
    let event = '';

    if (playerData.stamina <= 20) {
        event = `Pemain ${playerData.player} terlihat lelah. Pertimbangkan untuk mengganti pemain atau mengubah taktik.`;
    }

    if (matchEvent < 0.2) {
        event = `⚽️ ${playerData.player} mendapatkan peluang mencetak gol! Pilih tindakan: \n1. Tendang ke kanan\n2. Tendang ke kiri\n3. Umpan ke rekan`;
        playerData.situation = 'shooting';
    } else if (matchEvent < 0.4) {
        event = `⚠️ Pelanggaran! Kamu mendapatkan tendangan bebas. Pilih tindakan: \n1. Tendang langsung\n2. Umpan ke pemain lain\n3. Lakukan trik!`;
        playerData.situation = 'freekick';
    } else if (matchEvent < 0.6) {
        event = `🔥 ${playerData.opponentPlayer} dari ${playerData.opponentTeam} mencoba menyerang! Apakah kamu ingin bertahan atau menyerang balik?`;
        playerData.situation = 'counter';
    } else {
        event = `${playerData.player} sedang membawa bola di menit ${playerData.gameTime}.`;
    }

    if (!Array.isArray(playerData.matchLog)) playerData.matchLog = [];
    playerData.matchLog.push(event);

    if (playerData.gameTime >= 90) {
        playerData.hasWon = playerData.score > playerData.opponentScore;

        let resultMessage = playerData.hasWon ?
            `🎉 Kamu menang! 🎉` :
            `😢 Kamu kalah. 😢`;

        let rewardMessage = playerData.hasWon ?
            `🎁 Hadiah kamu: 1000 Poin!` :
            `Tidak ada hadiah untuk kekalahan ini.`;

        return m.reply(`
⚽️ Pertandingan selesai! Skor akhir: ${playerData.score} - ${playerData.opponentScore}.
${resultMessage}
${rewardMessage}
Log Pertandingan:\n${playerData.matchLog.join('\n')}
        `);
    }

    if (playerData.situation === 'shooting' || playerData.situation === 'freekick') {
        if (['1', '2', '3'].includes(text)) {
            let actionSuccess = Math.random() > 0.5;
            let actionResult = actionSuccess ? 'Berhasil!' : 'Gagal!';

            if (text === '3') {
                actionSuccess = Math.random() > 0.7;
                actionResult = actionSuccess ? 'Trik berhasil dan mencetak gol!' : 'Trik gagal!';
                playerData.score += actionSuccess ? 1 : 0;
            } else {
                playerData.score += actionSuccess ? 1 : 0;
            }

            playerData.matchLog.push(`Aksi ${playerData.player} ${actionResult}.`);
            playerData.situation = 'normal';
        } else {
            return m.reply(`Pilih tindakan: 1, 2, atau 3.`);
        }
    } else if (playerData.situation === 'counter') {
        if (text === '1' || text === '2') {
            let counterSuccess = Math.random() > 0.6;
            let counterResult = counterSuccess ? 'berhasil membawa bola dan mencetak gol!' : 'gagal melakukan serangan!';
            playerData.score += counterSuccess ? 1 : 0;
            playerData.matchLog.push(`Serangan balik ${playerData.player} ${counterResult}.`);
            playerData.situation = 'normal';
        } else {
            return m.reply(`Pilih untuk bertahan atau menyerang balik: 1 untuk bertahan, 2 untuk menyerang.`);
        }
    }

    m.reply(`${event}\n\nSkor sementara: ${playerData.team} ${playerData.score} - ${playerData.opponentScore} ${playerData.opponentTeam}`);
};

Fruatre.help = ['soccer'];
Fruatre.tags = ['rpg'];
Fruatre.command = /^(soccer)$/i;

export default Fruatre;