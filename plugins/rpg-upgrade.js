let handler = async (m, { conn, command, args, usedPrefix }) => { 
    try { 
        let user = global.db.data.users[m.sender];
        let kayu = user.kayu * 1;
        let batu = user.batu * 1;
        let string = user.string * 1;
        let money = user.money * 1;
        let iron = user.iron * 1;
        let fishingrod = user.fishingrod * 1;
        let pickaxe = user.pickaxe * 1;
        let sword = user.sword * 1;
        let type = (args[0] || '').toLowerCase();
        let prefix = usedPrefix;

        let lmao1 = `Gunakan format *${usedPrefix}${command} [type]*\nContoh: *${usedPrefix}${command} fishingrod*\n\n*📌 List yang bisa di-upgrade:*\n- FishingRod\n- Pickaxe\n- Sword`.trim();
        
        switch (type) {
            case 'fishingrod':
                if (fishingrod === 0) {
                    return conn.reply(m.chat, `Kamu belum memiliki FishingRod.\nKetik *${usedPrefix}craft fishingrod* untuk membuatnya.`, m);
                }
                if (fishingrod > 9) return conn.reply(m.chat, `FishingRod kamu sudah mencapai level maksimal.`, m);
                let _kayu = fishingrod * 25;
                let _string = fishingrod * 15;
                let _money = fishingrod * 10000;
                if (kayu < _kayu || string < _string || money < _money) {
                    return conn.reply(m.chat, `Material kamu kurang!\n${kayu < _kayu ? `- Kayu kurang: ${_kayu - kayu}\n` : ''}${string < _string ? `- String kurang: ${_string - string}\n` : ''}${money < _money ? `- Uang kurang: ${_money - money}` : ''}`, m);
                }
                user.fishingrod += 1;
                user.kayu -= _kayu;
                user.string -= _string;
                user.money -= _money;
                user.fishingroddurability = fishingrod * 50;
                conn.reply(m.chat, `Berhasil meng-upgrade FishingRod ke level ${fishingrod}.`, m);
                break;

            case 'pickaxe':
                if (pickaxe === 0) {
                    return conn.reply(m.chat, `Kamu belum memiliki Pickaxe.\nKetik *${usedPrefix}craft pickaxe* untuk membuatnya.`, m);
                }
                if (pickaxe > 9) return conn.reply(m.chat, `Pickaxe kamu sudah mencapai level maksimal.`, m);
                let __batu = pickaxe * 25;
                let __kayu = pickaxe * 15;
                let __money = pickaxe * 15000;
                if (batu < __batu || kayu < __kayu || money < __money) {
                    return conn.reply(m.chat, `Material kamu kurang!\n${batu < __batu ? `- Batu kurang: ${__batu - batu}\n` : ''}${kayu < __kayu ? `- Kayu kurang: ${__kayu - kayu}\n` : ''}${money < __money ? `- Uang kurang: ${__money - money}` : ''}`, m);
                }
                user.pickaxe += 1;
                user.kayu -= __kayu;
                user.batu -= __batu;
                user.money -= __money;
                user.pickaxedurability = pickaxe * 50;
                conn.reply(m.chat, `Berhasil meng-upgrade Pickaxe ke level ${pickaxe}.`, m);
                break;

            case 'sword':
                if (sword === 0) {
                    return conn.reply(m.chat, `Kamu belum memiliki Sword.\nKetik *${usedPrefix}craft sword* untuk membuatnya.`, m);
                }
                if (sword > 9) return conn.reply(m.chat, `Sword kamu sudah mencapai level maksimal.`, m);
                let _iron = sword * 25;
                let ___kayu = sword * 15;
                let ___money = sword * 10000;
                if (iron < _iron || kayu < ___kayu || money < ___money) {
                    return conn.reply(m.chat, `Material kamu kurang!\n${iron < _iron ? `- Iron kurang: ${_iron - iron}\n` : ''}${kayu < ___kayu ? `- Kayu kurang: ${___kayu - kayu}\n` : ''}${money < ___money ? `- Uang kurang: ${___money - money}` : ''}`, m);
                }
                user.sword += 1;
                user.iron -= _iron;
                user.kayu -= ___kayu;
                user.money -= ___money;
                user.sworddurability = sword * 50;
                conn.reply(m.chat, `Berhasil meng-upgrade Sword ke level ${sword}.`, m);
                break;

            default:
                conn.reply(m.chat, lmao1, m);
                break;
        }
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, 'Terjadi kesalahan.', m);
    }
};

handler.help = ['upgrade'];
handler.tags = ['rpg'];
handler.command = /^(up(grade)?)$/i;

handler.fail = null;

export default handler;