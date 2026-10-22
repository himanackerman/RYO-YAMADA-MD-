/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
let Fruatre = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return m.reply("Data pengguna tidak ditemukan. Silakan daftar terlebih dahulu!");

    const args = text.trim().split(' ');
    let commandType = args[0]?.toLowerCase();
    
    user.racing = user.racing || {
        car: null,
        track: null,
        races: 0,
        wins: 0,
        losses: 0,
        coins: 0,
        recordTime: null
    };

    switch (commandType) {
        case 'start':
            if (user.racing.car && user.racing.track) {
                m.reply(`Kamu sudah berada dalam balapan! Gunakan ${usedPrefix + command} race untuk memulai.`);
                return;
            }
            user.racing.car = 'mobil standar';
            user.racing.track = 'circuit biasa';
            m.reply(`Balapan dimulai! Kamu akan balapan dengan mobil "${user.racing.car}" di "${user.racing.track}". Gunakan ${usedPrefix + command} race untuk balapan.`);
            break;
        
        case 'race':
            if (!user.racing.car || !user.racing.track) {
                m.reply(`Kamu belum memulai balapan! Gunakan ${usedPrefix + command} start untuk memulai.`);
                return;
            }
            
            let raceTime = Math.random() * 10 + 20; 
            let opponentTime = Math.random() * 10 + 20;
            if (raceTime < opponentTime) {
                user.racing.wins++;
                user.racing.coins += 50;
                user.racing.recordTime = user.racing.recordTime ? Math.min(raceTime, user.racing.recordTime) : raceTime;
                m.reply(`Kamu menang! Waktu: ${raceTime.toFixed(2)} detik.\nKamu mendapatkan 50 koin.`);
            } else {
                user.racing.losses++;
                m.reply(`Kamu kalah! Waktu: ${raceTime.toFixed(2)} detik.\nCoba lagi untuk menang.`);
            }
            user.racing.races++;
            break;

        case 'status':
            let racingStatus = `
🏎️ *Status Balapan*
Mobil: ${user.racing.car || 'Belum dipilih'}
Lintasan: ${user.racing.track || 'Belum dipilih'}
Balapan Selesai: ${user.racing.races}
Kemenangan: ${user.racing.wins}
Kekalahan: ${user.racing.losses}
Rekor Waktu: ${user.racing.recordTime ? `${user.racing.recordTime.toFixed(2)} detik` : 'Belum ada'}
Koin: ${user.racing.coins}
            `;
            m.reply(racingStatus);
            break;

        case 'upgrade':
            if (user.racing.coins < 100) {
                m.reply("Koin tidak cukup untuk upgrade. Diperlukan 100 koin.");
                return;
            }
            user.racing.coins -= 100;
            user.racing.car = 'mobil sport';
            m.reply("Mobil kamu telah di-upgrade menjadi 'mobil sport'! Kini kamu memiliki mobil yang lebih cepat.");
            break;

        case 'reset':
            user.racing = {
                car: null,
                track: null,
                races: 0,
                wins: 0,
                losses: 0,
                coins: 0,
                recordTime: null
            };
            m.reply("Data balapan telah direset.");
            break;

        default:
            m.reply(`Perintah tidak dikenali. Gunakan perintah:\n${usedPrefix + command} start - Memulai balapan\n${usedPrefix + command} race - Melakukan balapan\n${usedPrefix + command} status - Melihat status balapan\n${usedPrefix + command} upgrade - Upgrade mobil dengan 100 koin\n${usedPrefix + command} reset - Reset data balapan`);
    }
};

Fruatre.help = ['racing start', 'racing race', 'racing status', 'racing upgrade', 'racing reset'];
Fruatre.tags = ['rpg'];
Fruatre.command = /^(racing)$/i;
Fruatre.register = true;
Fruatre.group = true;

export default Fruatre;