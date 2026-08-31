let handler = async (m, { conn }) => {
    try {
        const user = global.db.data.users[m.sender]
        const em = global.rpg.emoticon

        let __timers = Date.now() - (user.lastadventure || 0)
        let _timers = 3600000 - __timers
        let timers = clockString(_timers)

        if (__timers < 3600000) {
            return conn.reply(
                m.chat,
                `⏳ Kamu sudah berpetualang.\nTunggu *${timers}* lagi untuk berpetualang kembali.`,
                m
            )
        }

        if (user.health < 80) {
            return conn.reply(
                m.chat,
                `❤️ Health kamu kurang dari *80*.\nGunakan potion terlebih dahulu sebelum berpetualang.`,
                m
            )
        }

        let health = Math.floor(Math.random() * 30) + 10
        let exp = Math.floor(Math.random() * 10000) + 1000
        let money = Math.floor(Math.random() * 50000) + 5000

        let diamond = Math.floor(Math.random() * 5) + 1
        let emerald = Math.floor(Math.random() * 10) + 1
        let potion = Math.floor(Math.random() * 3) + 1
        let trash = Math.floor(Math.random() * 100) + 1

        let common = Math.floor(Math.random() * 3) + 1
        let uncommon = Math.floor(Math.random() * 2) + 1
        let mythic = Math.random() < 0.25 ? 1 : 0
        let legendary = Math.random() < 0.1 ? 1 : 0

        let apel = Math.floor(Math.random() * 5)
        let mangga = Math.floor(Math.random() * 5)
        let jeruk = Math.floor(Math.random() * 5)
        let pisang = Math.floor(Math.random() * 5)
        let anggur = Math.floor(Math.random() * 5)

        let musuh = pickRandom([
            'Raksasa',
            'Beruang',
            'Harimau',
            'Macan',
            'Bandit',
            'Goblin',
            'Naga',
            'Monster Hutan'
        ])

        user.health -= health

        user.exp += exp
        user.money += money

        user.diamond += diamond
        user.emerald += emerald
        user.potion += potion
        user.trash += trash

        user.common += common
        user.uncommon += uncommon
        user.mythic += mythic
        user.legendary += legendary

        user.apel += apel
        user.mangga += mangga
        user.jeruk += jeruk
        user.pisang += pisang
        user.anggur += anggur

        if (user.horse > 0) user.horseexp += Math.floor(Math.random() * 30)
        if (user.cat > 0) user.catexp += Math.floor(Math.random() * 30)
        if (user.fox > 0) user.foxexp += Math.floor(Math.random() * 30)
        if (user.robo > 0) user.roboexp += Math.floor(Math.random() * 30)
        if (user.dragon > 0) user.dragonexp += Math.floor(Math.random() * 30)
        if (user.lion > 0) user.lionexp += Math.floor(Math.random() * 30)
        if (user.rhinoceros > 0) user.rhinocerosexp += Math.floor(Math.random() * 30)
        if (user.centaur > 0) user.centaurexp += Math.floor(Math.random() * 30)
        if (user.kyubi > 0) user.kyubiexp += Math.floor(Math.random() * 30)
        if (user.griffin > 0) user.griffinexp += Math.floor(Math.random() * 30)
        if (user.phonix > 0) user.phonixexp += Math.floor(Math.random() * 30)
        if (user.wolf > 0) user.wolfexp += Math.floor(Math.random() * 30)

        if (user.armor > 0) {
            user.armordurability = Math.max(0, user.armordurability - Math.floor(Math.random() * 3))
        }

        if (user.sword > 0) {
            user.sworddurability = Math.max(0, user.sworddurability - Math.floor(Math.random() * 3))
        }

        user.lastadventure = Date.now()

        let txt = `
⚔️ Kamu bertarung melawan *${musuh}*

❤️ Health berkurang *-${health}*

🎁 *Hasil Petualangan*

${em('exp')} Exp: +${exp}
${em('money')} Money: +${money}
${em('diamond')} Diamond: +${diamond}
${em('emerald')} Emerald: +${emerald}
${em('potion')} Potion: +${potion}
${em('trash')} Trash: +${trash}

${em('common')} Common: +${common}
${em('uncommon')} Uncommon: +${uncommon}
${em('mythic')} Mythic: +${mythic}
${em('legendary')} Legendary: +${legendary}

${em('apel')} Apel: +${apel}
${em('mangga')} Mangga: +${mangga}
${em('jeruk')} Jeruk: +${jeruk}
${em('pisang')} Pisang: +${pisang}
${em('anggur')} Anggur: +${anggur}
`.trim()

        conn.reply(m.chat, txt, m)

    } catch (e) {
        console.error(e)
        conn.reply(m.chat, 'Terjadi kesalahan saat berpetualang.', m)
    }
}

handler.help = ['petualang']
handler.tags = ['rpg']
handler.command = /^(petualang|adventure)$/i
handler.rpg = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60

    return [h, m, s]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}