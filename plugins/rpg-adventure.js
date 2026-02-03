let handler = async (m, { conn, usedPrefix, owner }) => { 
    try { 
        let __timers = (new Date - global.db.data.users[m.sender].lastadventure);
        let _timers = (3600000 - __timers);
        let timers = clockString(_timers);
        if (global.db.data.users[m.sender].health > 79) {
            if (new Date - global.db.data.users[m.sender].lastadventure > 3600000) {
                let armor = global.db.data.users[m.sender].armor;
                let fox = global.db.data.users[m.sender].fox;
                let cat = global.db.data.users[m.sender].cat;
                let dog = global.db.data.users[m.sender].dog;
                let horse = global.db.data.users[m.sender].horse;

                let health = Math.floor(Math.random() * 101);
                let exp = Math.floor(Math.random() * 10000);
                let uang = Math.floor(Math.random() * 100000);
                let trash = Math.floor(Math.random() * 10000);
                let emerald = Math.floor(Math.random() * 100);
                let _potion = ['1', '2', '3'];
                let potion = _potion[Math.floor(Math.random() * _potion.length)];
                let _diamond = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
                let diamond = _diamond[Math.floor(Math.random() * _diamond.length)];
                let _common = ['1', '2', '3'];
                let common = _common[Math.floor(Math.random() * _common.length)];
                let _uncommon = ['1', '2', '1', '2'];
                let uncommon = _uncommon[Math.floor(Math.random() * _uncommon.length)];
                let mythic = Math.floor(Math.random() * 3) + 1;
                let legendary = Math.floor(Math.random() * 3) + 1;
                let itemrand = [`${mythic} Peti Mistis Langka`, `${legendary} Peti Legendary Langka`];
                let rendem = itemrand[Math.floor(Math.random() * itemrand.length)];

                let str = `
Nyawa berkurang sebesar -${health} karena kamu melawan ${pickRandom(['Raksasa', 'Beruang', 'Harimau', 'Macan', 'Iblis'])}.
Hasil petualanganmu:
- EXP: ${exp}
- Uang: ${uang}
- Berlian: ${diamond}
- Emerald: ${emerald}
- Sampah: ${trash}
- Potion: ${potion}
- Common crate: ${common}
- Uncommon crate: ${uncommon}
- Bonus: ${rendem}
                `.trim();

                conn.reply(m.chat, str, m);

                global.db.data.users[m.sender].health -= health;
                global.db.data.users[m.sender].exp += exp;
                global.db.data.users[m.sender].money += uang;
                global.db.data.users[m.sender].potion += potion;
                global.db.data.users[m.sender].diamond += diamond;
                global.db.data.users[m.sender].emerald += emerald;
                global.db.data.users[m.sender].common += common;
                global.db.data.users[m.sender].uncommon += uncommon;
                global.db.data.users[m.sender].trash += trash;
                global.db.data.users[m.sender].mythic += mythic;
                global.db.data.users[m.sender].legendary += legendary;
                global.db.data.users[m.sender].lastadventure = new Date * 1;
            } else {
                conn.reply(m.chat, `Kamu sudah berpetualang hari ini. Tunggu ${timers} lagi untuk berpetualang lagi.`, m);
            }
        } else {
            conn.reply(m.chat, `Nyawa kamu terlalu rendah (minimal 80) untuk berpetualang.\nGunakan perintah *${usedPrefix}heal* untuk memulihkan nyawa atau beli potion dengan *${usedPrefix}buy potion (jumlah)*.`, m);
        }
    } catch (e) {
        console.log(e);
        conn.reply(m.chat, 'Terjadi kesalahan.', m);
    }
};

handler.help = ['petualang'];
handler.tags = ['rpg'];
handler.command = /^(petualang|adventure)$/i;
handler.group = true;
handler.fail = null;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}