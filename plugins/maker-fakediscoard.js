

/*

# Fitur : Fake Discord Chat
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : local (canvas)

   ⚠️ _Note_ ⚠️
jangan hapus wm ini banggg

*/

import { createCanvas, loadImage } from 'canvas'
import moment from 'moment-timezone'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text || !text.includes('|')) {
      return m.reply(`🧙‍♂️ Mantra belum lengkap!\nContoh: ${usedPrefix + command} username|pesan|url_pp`);
    }

    let [username, pesan, ppUrl] = text.split('|').map(v => v.trim());

    if (!username || !pesan) {
      return m.reply(`⚠️ Format salah!\nGunakan: ${usedPrefix + command} username|pesan|url_pp`);
    }

    const avatar = await loadImage(ppUrl || 'https://files.catbox.moe/ifx2y7.png');
    const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss');

    const canvas = createCanvas(900, 200);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2f3136';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.arc(60, 60, 40, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 20, 20, 80, 80);
    ctx.restore();

    ctx.font = 'bold 22px Sans';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(username, 120, 55);

    const usernameWidth = ctx.measureText(username).width;

    ctx.font = '12px Sans';
    ctx.fillStyle = '#72767d';
    ctx.fillText(`Today at ${waktu} WIB`, 120 + usernameWidth + 10, 55);

    ctx.font = '20px Sans';
    ctx.fillStyle = '#dcddde';
    ctx.fillText(pesan, 120, 85);

    const buffer = canvas.toBuffer('image/png');

    await m.reply('⏳ Sedang merakit Discord palsu... sabar ya bang');
    await conn.sendFile(m.chat, buffer, 'fake-discord.png', '✅ Jadi nih bang fake Discord-nya!', m);
  } catch (e) {
    console.error(e);
    m.reply(String(e));
  }
};

handler.command = ['fdc', 'fakediscoard'];
handler.tags = ['maker'];
handler.help = ['fdc <username|pesan|url>', 'fakediscoard'];
handler.limit = true;

export default handler;