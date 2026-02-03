let handler = async (m, { conn, participants }) => {
    let targetUser = m.mentionedJid[0] || participants[Math.floor(Math.random() * participants.length)].id;
    let targetName = conn.getName(targetUser);
    let __timers = (new Date() - global.db.data.users[m.sender].lastmisi);
    let _timers = (1200000 - __timers); // Ubah nilai cooldown menjadi 20 menit
    let order = global.db.data.users[m.sender].ojekk;
    let timers = clockString(_timers);
    let name = conn.getName(m.sender);
    let user = global.db.data.users[m.sender];
    let id = m.sender;
    let kerja = 'ewe-paksa';
    conn.misi = conn.misi ? conn.misi : {};

    if (id in conn.misi) {
        m.reply(m.chat, `Selesaikan Misi ${conn.misi[id][0]} Terlebih Dahulu`, m);
        throw false;
    }

    if (new Date() - user.lastmisi > 1200000) { // Ubah nilai cooldown menjadi 20 menit
        let randomaku1 = Math.floor(Math.random() * 1000000);
        let randomaku2 = Math.floor(Math.random() * 10000);
        
        var dimas = `
👙 ${name} paksa buka baju ${targetName}😋
`.trim();

        var dimas2 = `
🥵💦 ${targetName} sszz Ahhhh.....
`.trim();

        var dimas3 = `
🥵Ahhhh, Sakitttt!! >////<
 💦Crotttt.....
  💦Crottt lagi
`.trim();

        var dimas4 = `
🥵💦💦Ahhhhhh😫
`.trim();

        var hsl = `
*—[ Hasil Ewe Paksa ${name} ke ${targetName} ]—*
➕ 💹 Uang = [ ${randomaku1} ]
➕ ✨ Exp = [ ${randomaku2} ]
➕ 😍 Order Selesai = +1
➕ 📥Total Dosa = ${order}
`.trim();

        user.money += randomaku1;
        user.exp += randomaku2;
        user.ojekk += 1;
        
        conn.misi[id] = [
            kerja,
            setTimeout(() => {
                delete conn.misi[id];
            }, 27000)
        ];

        let message = '😋mulai ewe paksa..';
        const initialMessage = await m.reply(message);

        // Loop to gradually update the message with a delay between each edit
        let messages = [dimas, dimas2, dimas3, dimas4, hsl];
        for (let i = 0; i < messages.length; i++) {
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 5000)); // Adjust the timing for each update
            await conn.sendMessage(m.chat, { text: messages[i], edit: initialMessage.key });
        }

        user.lastmisi = new Date() * 1;
    } else {
        m.reply(`Silahkan Menunggu Selama ${timers}, Untuk *Ewe-paksa* Kembali`);
    }
};

handler.help = ['ewepaksa @tag'];
handler.tags = ['rpg'];
handler.command = /^(ewepaksa|perkosa)$/i;
handler.register = true;
handler.group = true;
handler.limit = false
handler.premium = true;

export default handler;

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}