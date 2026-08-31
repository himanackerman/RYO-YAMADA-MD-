let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let hadiahExp = Math.floor(Math.random() * 3000) + 1500
    let hadiahMoney = Math.floor(Math.random() * 50000000) + 10000000
    let healthNerf = Math.floor(Math.random() * 5) - 10
    let bonusStamina = Math.floor(Math.random() * 50) + 20

    let user = users[m.sender]
    let __timers = (new Date - user.lastHero)
    let _timers = (800000 - __timers)
    let timers = clockString(_timers)
    if (__timers < 800000) {
        return m.reply(`⏳ Kamu harus menunggu ${timers} untuk mainkan fitur hero yaw`)
    }
    
    if (user.health < 80) return m.reply(`Kamu terlalu lemas! Gunakan perintah *.heal* untuk memulihkan kesehatan atau *.makan* untuk mengisi energi.`);
    
  const karakterList = [
    "Ultraman",
    "Batman",
    "Superman",
    "spiderman",
    "thanos",
    "hayabusa"
  ];

const monsterList = [
    "Godzilla",
    "Kingkong",
    "Gorlilaa",
    "Vampir",
    "Gorlilaa Batu"
  ];

  const kataTerakhir = [
    "Sialan Lu hitaam",
    "Awas aja Aku Akan Kembali",
    "Aku Akan Balas Dendam",
    "Kuat Banget Bangsat, Arghh",
    "Aku Akan Lebih Kuat Lihat Saja",
  ];

  const efekSerangan = [
    "🔥Semburan Api",
    "💣 Jebakan Bom",
    "⚡ Listrik ",
    "🌠 Meteor Api ",
    "👊Pukulan Keras",
    "💥Di Hantam Bertubi Tubi"
  ];
  
  const namaHero = karakterList[Math.floor(Math.random() * karakterList.length)];
 const monster = monsterList[Math.floor(Math.random() * monsterList.length)];
  const kata = kataTerakhir[Math.floor(Math.random() * kataTerakhir.length)];
  const efek = efekSerangan[Math.floor(Math.random() * efekSerangan.length)];
  
    // Kirim pesan awal (yang akan diedit nanti)
    let medMsg = await conn.sendMessage(m.chat, { text: `👨‍🎤 @${m.sender.split('@')[0]} sedang bersiap Menjadi Pahlawan Warga Kota...`, mentions: [m.sender] }, { quoted: m })

    let steps = [
        `Menyerang Dengan sekuat Tenagaaa`,
        `Sini Lu Monster Donggo`,
        `Kuat juga njir..`,
        `${monster}: Lemah`,
        `Harus Di Kasi Paham Ini`, 
        `Akhirnya Kalah Juga Ini Monsterr`
    ]

    for (let step of steps) {
        await delay(6000)
        await conn.sendMessage(m.chat, {
            text: step,
            edit: medMsg.key
        })
    }

    // Hadiah heroo
    user.exp += hadiahExp
    user.money += hadiahMoney
    user.health = Math.min(user.health - healthNerf, 10)
    user.stamina = Math.min(user.stamina + bonusStamina, 100)
    user.lastHero = new Date * 1

    // Kirim pesan hasil akhir
    await conn.sendMessage(m.chat, {
        text: `
╭─── *HERO HASIL* ───╮

 *HERO:* ${namaHero}
 *MONSTER:* ${monster}

 ⪼ *Kata Terakhir Monster:*
 ${kata}
 ⪼ *Efek serangan:* ${efek}
 ⪼ *❤️Healt Berkurang:* ${healthNerf} 


━━Hadiah Dari Warga kota━━
 <-- Charger Dari Warga -->

 ⪼ Stamina Bertambah :  +${bonusStamina}
 ⪼ Exp yang Bertambah : +${hadiahExp}
 ⪼ Money +Rp ${toRupiah(hadiahMoney)}  
╰────────────────────
`.trim()
    }, { quoted: m })
}

handler.help = ['hero']
handler.tags = ['rpg']
handler.command = /^(hero)$/i
handler.rpg = true
export default handler

function clockString(ms) {
    let m = Math.floor(ms / 60000)
    let s = Math.floor((ms % 60000) / 1000)
    return `${m} menit ${s} detik`
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const toRupiah = number => parseInt(number).toLocaleString('id-ID')