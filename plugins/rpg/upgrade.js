let handler = async (m, { conn, command, args, usedPrefix }) => {
    try {
        const user = global.db.data.users[m.sender]
        const em = global.rpg.emoticon

        let wood = user.wood * 1
        let rock = user.rock * 1
        let string = user.string * 1
        let money = user.money * 1
        let iron = user.iron * 1

        let fishingrod = user.fishingrod * 1
        let pickaxe = user.pickaxe * 1
        let sword = user.sword * 1
        let armor = user.armor * 1

        let type = (args[0] || '').toLowerCase()

        let txt = `
Gunakan format *${usedPrefix + command} <type>*

Contoh:
${usedPrefix + command} fishingrod
${usedPrefix + command} pickaxe
${usedPrefix + command} sword
${usedPrefix + command} armor

📌 Upgrade yang tersedia:
🎣 FishingRod
⛏️ Pickaxe
⚔️ Sword
🥼 Armor
`.trim()

        switch (type) {
            case 'fishingrod': {
                if (fishingrod < 1) {
                    return m.reply(`Kamu belum memiliki FishingRod.\nGunakan *${usedPrefix}craft fishingrod* terlebih dahulu.`)
                }

                if (fishingrod >= 10) {
                    return m.reply('🎣 FishingRod sudah mencapai level maksimal.')
                }

                let needWood = fishingrod * 25
                let needString = fishingrod * 15
                let needMoney = fishingrod * 10000

                if (
                    wood < needWood ||
                    string < needString ||
                    money < needMoney
                ) {
                    return m.reply(
                        `Material tidak cukup!\n\n` +
                        `${wood < needWood ? `${em('wood')} Wood: ${needWood - wood}\n` : ''}` +
                        `${string < needString ? `${em('string')} String: ${needString - string}\n` : ''}` +
                        `${money < needMoney ? `${em('money')} Money: ${needMoney - money}` : ''}`
                    )
                }

                user.fishingrod += 1
                user.wood -= needWood
                user.string -= needString
                user.money -= needMoney
                user.fishingroddurability = user.fishingrod * 50

                return m.reply(
                    `✅ FishingRod berhasil di-upgrade ke Level ${user.fishingrod}

${em('wood')} -${needWood}
${em('string')} -${needString}
${em('money')} -${needMoney}`
                )
            }

            case 'pickaxe': {
                if (pickaxe < 1) {
                    return m.reply(`Kamu belum memiliki Pickaxe.\nGunakan *${usedPrefix}craft pickaxe* terlebih dahulu.`)
                }

                if (pickaxe >= 10) {
                    return m.reply('⛏️ Pickaxe sudah mencapai level maksimal.')
                }

                let needRock = pickaxe * 25
                let needWood = pickaxe * 15
                let needMoney = pickaxe * 15000

                if (
                    rock < needRock ||
                    wood < needWood ||
                    money < needMoney
                ) {
                    return m.reply(
                        `Material tidak cukup!\n\n` +
                        `${rock < needRock ? `${em('rock')} Rock: ${needRock - rock}\n` : ''}` +
                        `${wood < needWood ? `${em('wood')} Wood: ${needWood - wood}\n` : ''}` +
                        `${money < needMoney ? `${em('money')} Money: ${needMoney - money}` : ''}`
                    )
                }

                user.pickaxe += 1
                user.rock -= needRock
                user.wood -= needWood
                user.money -= needMoney
                user.pickaxedurability = user.pickaxe * 50

                return m.reply(
                    `✅ Pickaxe berhasil di-upgrade ke Level ${user.pickaxe}

${em('rock')} -${needRock}
${em('wood')} -${needWood}
${em('money')} -${needMoney}`
                )
            }

            case 'sword': {
                if (sword < 1) {
                    return m.reply(`Kamu belum memiliki Sword.\nGunakan *${usedPrefix}craft sword* terlebih dahulu.`)
                }

                if (sword >= 10) {
                    return m.reply('⚔️ Sword sudah mencapai level maksimal.')
                }

                let needIron = sword * 25
                let needWood = sword * 15
                let needMoney = sword * 10000

                if (
                    iron < needIron ||
                    wood < needWood ||
                    money < needMoney
                ) {
                    return m.reply(
                        `Material tidak cukup!\n\n` +
                        `${iron < needIron ? `${em('iron')} Iron: ${needIron - iron}\n` : ''}` +
                        `${wood < needWood ? `${em('wood')} Wood: ${needWood - wood}\n` : ''}` +
                        `${money < needMoney ? `${em('money')} Money: ${needMoney - money}` : ''}`
                    )
                }

                user.sword += 1
                user.iron -= needIron
                user.wood -= needWood
                user.money -= needMoney
                user.sworddurability = user.sword * 50

                return m.reply(
                    `✅ Sword berhasil di-upgrade ke Level ${user.sword}

${em('iron')} -${needIron}
${em('wood')} -${needWood}
${em('money')} -${needMoney}`
                )
            }

            case 'armor': {
                if (armor < 1) {
                    return m.reply(`Kamu belum memiliki Armor.\nGunakan *${usedPrefix}craft armor* terlebih dahulu.`)
                }

                if (armor >= 10) {
                    return m.reply('🥼 Armor sudah mencapai level maksimal.')
                }

                let needIron = armor * 30
                let needMoney = armor * 20000

                if (
                    iron < needIron ||
                    money < needMoney
                ) {
                    return m.reply(
                        `Material tidak cukup!\n\n` +
                        `${iron < needIron ? `${em('iron')} Iron: ${needIron - iron}\n` : ''}` +
                        `${money < needMoney ? `${em('money')} Money: ${needMoney - money}` : ''}`
                    )
                }

                user.armor += 1
                user.iron -= needIron
                user.money -= needMoney
                user.armordurability = user.armor * 50

                return m.reply(
                    `✅ Armor berhasil di-upgrade ke Level ${user.armor}

${em('iron')} -${needIron}
${em('money')} -${needMoney}`
                )
            }

            default:
                return m.reply(txt)
        }
    } catch (e) {
        console.error(e)
        m.reply('Terjadi kesalahan saat upgrade.')
    }
}

handler.help = ['upgrade']
handler.tags = ['rpg']
handler.command = /^(upgrade|up)$/i
handler.rpg = true

export default handler