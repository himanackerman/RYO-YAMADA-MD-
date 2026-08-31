let handler = async (m, { conn, text, args, command }) => {
  conn.duel = conn.duel || [];
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : args[0]
    ? args[0].replace(/[@ .+-]/g, '').replace(' ', '') + '@s.whatsapp.net'
    : null;

  if (!who) return m.reply('Tag seseorang yang ingin diajak duel!');

  let enemy = global.db.data.users[who] || {};
  let user = global.db.data.users[m.sender] || {};
  let count = args[1] ? Math.min(100, Math.max(parseInt(args[1]), 1)) : 1;
  let nama = await conn.getName(m.sender);

  let randomAku = Math.floor(Math.random() * 101);
  let randomKamu = Math.floor(Math.random() * 81);

  let Aku = randomAku;
  let Kamu = randomKamu;

  let __timers = new Date() - (user.lastduel || 0);
  let _timers = 300000 - __timers;
  let timers = clockString(_timers);

  try {
    if (/duel/.test(command)) {
      if (new Date() - (user.lastduel || 0) < 300000) {
        return conn.reply(m.chat, `Kamu sudah berduel! Tunggu selama ${timers}`, m);
      }

      conn.duel.push(who);
      let message = `@${m.sender.split('@')[0]} mengajak duel ${await conn.getName(who)}\n\nBalas dengan *gass* untuk menerima atau *skip* untuk menolak.`;
      return conn.reply(m.chat, message, m, { mentions: [m.sender, who] });
    }

    if (/gass/.test(command)) {
      if (!conn.duel.includes(m.sender)) throw 'Kamu tidak diajak duel!';
      user.lastduel = new Date() * 1;

      if (Aku > Kamu) {
        user.money = (user.money || 0) - 900;
        enemy.money = (enemy.money || 0) + 900;
        conn.duel = conn.duel.filter(id => id !== m.sender);
        conn.reply(m.chat, `@${who.split('@')[0]} menang duel!\n*Hadiah:*\n+Rp.900`, m, { mentions: [who] });
      } else if (Aku < Kamu) {
        user.money = (user.money || 0) + 450;
        enemy.money = (enemy.money || 0) - 450;
        conn.duel = conn.duel.filter(id => id !== m.sender);
        conn.reply(m.chat, `@${who.split('@')[0]} kalah duel!\n*Hadiah:*\n+Rp.450`, m, { mentions: [who] });
      } else {
        user.money = (user.money || 0) + 250;
        enemy.money = (enemy.money || 0) + 250;
        conn.duel = conn.duel.filter(id => id !== m.sender);
        conn.reply(m.chat, `@${who.split('@')[0]} Seri dalam duel!\n*Hadiah:*\n+Rp.250 untuk masing-masing.`, m, { mentions: [who] });
      }
    }

    if (/skip/.test(command)) {
      if (!conn.duel.includes(m.sender)) return conn.reply(m.chat, 'Kamu tidak diajak duel!', m);
      conn.reply(m.chat, `@${who.split('@')[0]} membatalkan ajakan duel.`, m, { mentions: [who] });
      conn.duel = conn.duel.filter(id => id !== m.sender);
    }
  } catch (e) {
    return m.reply(`${e}`);
  }
};

handler.help = ['duel'];
handler.tags = ['rpg'];
handler.command = /^(duel|gass|skip)$/i;
handler.group = true;

export default handler;

function clockString(ms) {
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`;
}