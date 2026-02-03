let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    global.db.data.users[m.sender].money = 10000
    global.db.data.users[m.sender].warn += 1
    global.db.data.users[m.sender].exp = 1000

    let eve = `Hasil Ngewe
Money: Rp10.000
Exp: 1000
Warn: 1
Order: Berhasil`

    const arr = [
        { text: `*Mencari Cewe Michat*`, timeout: 5000 },
        { text: `*Mendapatkan Tobrut Sange*`, timeout: 4000 },
        { text: `*Mulai Menusuk memek nya🍆*`, timeout: 3000 },
        { text: `*Sedikit lagi dia muncrat💦*`, timeout: 3000 },
        { text: `*Crotttt💦💦*`, timeout: 2000 },
        { text: `*ahhh ahhh*`, timeout: 2000 },
        { text: `*${eve}*`, timeout: 3000 },
    ];

    const lll = await conn.sendMessage(m.chat, { text: '...' }, { quoted: m });

    for (let i = 0; i < arr.length; i++) {
        await new Promise(resolve => setTimeout(resolve, arr[i].timeout));
        await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: lll.key,
                type: 14,
                editedMessage: {
                    conversation: arr[i].text
                }
            }
        }, {});
    }    
}

handler.command = /^(ewe|anu)$/i
handler.help = ['ewe', 'anu']
handler.tags = ['rpg']
handler.owner = false
handler.premium = true
handler.limit = false

export default handler