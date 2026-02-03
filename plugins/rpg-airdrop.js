import fetch from 'node-fetch';

const timeout = 3600000; // 1 jam dalam milidetik

async function handler(m, { conn, args }) {
    let u = global.db.data.users[m.sender];
    let time = u.lastclaim + timeout;
    if (Date.now() - u.lastclaim < timeout) 
        throw `*Sudah Melakukan Pencarian Airdrop!* 🪙\nHarus menunggu selama ${clockString(time - Date.now())} agar bisa mencari Airdrop kembali.`;
    
    let Aku = Math.floor(Math.random() * 101);
    let Kamu = Math.floor(Math.random() * 81);

    if (Aku > Kamu) {
        let rewards = {
            sampah: pickRandom(Array.from({ length: 50 }, (_, i) => (i + 1).toString())),
            kayu: pickRandom(Array.from({ length: 50 }, (_, i) => (i + 1).toString())),
            batu: pickRandom(Array.from({ length: 50 }, (_, i) => (i + 1).toString()))
        };
        await conn.sendFile(m.chat, 'https://telegra.ph/file/60437ce6d807b605adf5e.jpg', 'zonk.jpg', `*Airdrop Ampas!* Ternyata isinya tidak sesuai ekspektasi\n\n*Rewards*\n• *Sampah:* ${rewards.sampah}\n• *Kayu:* ${rewards.kayu}\n• *Batu:* ${rewards.batu}`, m);
        u.sampah += parseInt(rewards.sampah);
        u.kayu += parseInt(rewards.kayu);
        u.batu += parseInt(rewards.batu);
    } else if (Aku < Kamu) {
        let rewards = {
            limit: pickRandom(['10', '20', '30']),
            money: pickRandom(['10000', '100000', '500000']),
            point: pickRandom(['10000', '100000', '500000'])
        };
        await conn.sendFile(m.chat, 'https://telegra.ph/file/d3bc1d7a97c62d3baaf73.jpg', 'rare.jpg', `*Airdrop Rare!*, Kamu mendapatkan Kotak Airdrop *Rare*\n\nSelamat kamu mendapatkan *Rewards*\n• *Limit:* ${rewards.limit}\n• *Money:* ${rewards.money}\n• *Point:* ${rewards.point}`, m);
        u.limit += parseInt(rewards.limit);
        u.money += parseInt(rewards.money);
        u.poin += parseInt(rewards.point);
    } else {
        await conn.sendFile(m.chat, 'https://telegra.ph/file/5d71027ecbcf771b299fb.jpg', 'zonk.jpg', `*Airdrop Zonks!*, Kamu mendapatkan Kotak Airdrop *Zonk (Kosong)*\n\nSelamat kamu mendapatkan *Rewards*\n• *Money:* -1.000.000\n• *Isi:* Angin`, m);
        u.money -= 1000000;
    }
    u.lastclaim = Date.now();
}

handler.help = ['airdrop'];
handler.tags = ['rpg'];
handler.command = /^(airdrop)$/i;
handler.group = true;
handler.rpg = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clockString(ms) {
    let d = Math.floor(ms / 86400000);
    let h = Math.floor(ms / 3600000) % 24;
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return `\n*${d}* _Hari_ ☀️\n *${h}* _Jam_ 🕐\n *${m}* _Menit_ ⏰\n *${s}* _Detik_ ⏱️`;
}