/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
let handler = async (m, { conn, command, text, args }) => {
    let koinBenar = 100;
    let taruhanMin = 50;
    let koinSalah = 0;
    switch(command) {
        case 'togel':
            if (global.db.data.users[m.sender].angka) return conn.reply(m.chat, 'Kamu masih memiliki permainan togel yang sedang berjalan. Silakan selesaikan permainan tersebut terlebih dahulu.', m);
            if (args.length === 0) return conn.reply(m.chat, `Untuk memasang taruhan, gunakan format: *.togel [taruhan]*`, m);
            if (isNaN(args[0])) return conn.reply(m.chat, `Taruhan harus berupa angka.`, m);
            let taruhan = parseInt(args[0]);
            if (taruhan < taruhanMin) return conn.reply(m.chat, `Maaf, taruhan minimal adalah ${taruhanMin} koin.`, m);
            if (global.db.data.users[m.sender].koin < taruhan) return conn.reply(m.chat, `Maaf, koin yang kamu miliki tidak cukup untuk memasang taruhan sebesar ${taruhan} koin.`, m);
            global.db.data.users[m.sender].koin -= taruhan;
            let angka = Math.floor(Math.random() * 10000); // Mendapatkan angka acak empat digit
            m.reply(`Angka kamu: ${angka}\nHarap masukkan angka di atas, bot akan mengacaknya.`);
            m.reply('*Masukkan angka kamu dengan menggunakan command* .angka [angka]');
            m.reply(`Pengumuman: Pemenang akan diberikan hadiah 100 koin`);
            global.db.data.users[m.sender].angka = angka;
            break;
        case 'angka':
            if (!global.db.data.users[m.sender].angka) return conn.reply(m.chat, 'Kamu belum menggunakan perintah .togel', m);
            if (args.length === 0 || args[0].length !== 4 || isNaN(args[0])) return conn.reply(m.chat, 'Masukkan angka empat digit!', m);
            let angkaKamu = args[0];
            let angkaBot;
            let digitKamu = angkaKamu.split('').map(Number); // Mendapatkan digit dari angka pengguna
            do {
                angkaBot = parseInt(digitKamu.sort(() => Math.random() - 0.5).join('')); // Mengacak digit tetapi tetap mempertahankan digit yang sama dengan angka pengguna
            } while (angkaBot === parseInt(angkaKamu) || angkaBot.toString().length !== 4); // Memastikan angka bot tidak sama dengan angka pengguna dan tetap memiliki empat digit
            let pesan, hadiah;
            if (angkaKamu == angkaBot) {
                pesan = `
*「 JUDI TOGEL 」*

Angka Kamu : ${angkaKamu}
Angka Bot : ${angkaBot}

Benar 🪙
Hadiah: ${koinBenar} koin
`.trim();
                hadiah = koinBenar;
                global.db.data.users[m.sender].koin += koinBenar;
            } else {
                pesan = `
*「 JUDI TOGEL 」*

Angka Kamu : ${angkaKamu}
Angka Bot : ${angkaBot}

Salah🙄
`.trim();
                hadiah = 0; // tidak ada hadiah jika salah tebak
            }
            conn.reply(m.chat, pesan, m);
            delete global.db.data.users[m.sender].angka; // Menghapus data permainan setelah hasil tebakan diberikan
            break;
        case 'stoptogel':
            if (!global.db.data.users[m.sender].angka) return conn.reply(m.chat, 'Kamu belum menggunakan perintah .togel', m);
            let angkaBotStop = global.db.data.users[m.sender].angka;
            m.reply(`Angka Bot: ${angkaBotStop}`);
            delete global.db.data.users[m.sender].angka;
            break;
    }
}

handler.help = ['togel', 'angka', 'stoptogel'];
handler.tags = ['game'];
handler.command = /^(togel|angka|stoptogel)$/i;
handler.limit = false;
handler.fail = null;
handler.private = true;

export default handler;
/* JANGAN HAPUS INI 
SCRIPT BY © VYNAA VALERIE 
•• recode kasih credits 
•• contacts: (6282389924037)
•• instagram: @vynaa_valerie 
•• (github.com/VynaaValerie) 
*/
