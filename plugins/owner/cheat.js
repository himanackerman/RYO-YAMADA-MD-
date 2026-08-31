let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
        conn.reply(m.chat, `*Succes Cheat !*`, m)
        global.db.data.users[m.sender].money = 99999999999
        global.db.data.users[m.sender].limit = 9999
        global.db.data.users[m.sender].level = 232
        global.db.data.users[m.sender].exp = 99999999
        global.db.data.users[m.sender].sampah = 999999
        global.db.data.users[m.sender].potion = 999999
        global.db.data.users[m.sender].common = 999999
        global.db.data.users[m.sender].uncommon = 999999
        global.db.data.users[m.sender].mythic = 999999
        global.db.data.users[m.sender].legendary = 999999
        global.db.data.users[m.sender].potion =  999999

global.db.data.users[m.sender].diamond =  999999

global.db.data.users[m.sender].poinxp =  999999

global.db.data.users[m.sender].bank =  999999999
}
handler.command = /^(own-cheat|cheat-own|o-cheat|cit)$/i

handler.owner = true
handler.group = true
export default handler