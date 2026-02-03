
/*
📌 Nama Fitur: Cpanel
🏷️ Type : Plugin ESM
🔗 Sumber : https://whatsapp.com/channel/0029VaxvdhJ6buMSjkRBNR2d
✍️ Convert By ZenzXD
Note : Gpp kalian ambil plugin nya tapi jan hapus wm bg :v ;(
*/

import fetch from 'node-fetch';
import baileys from '@adiwajshing/baileys';
const { proto } = baileys;
import '../config.js';

function generatePassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Contoh:\n\n*${command} username,628xxx* atau *${command} username*`);

  let [usernem, nom] = text.split(',').map(s => s.trim());
  if (!usernem) return m.reply(`Contoh:\n\n*${command} username,628xxx* atau *${command} username*`);

  const username = usernem.toLowerCase();
  const nomor = nom
    ? nom.replace(/\D/g, '') + '@s.whatsapp.net'
    : m.chat.endsWith('@g.us')
      ? m.sender
      : m.chat;

  const email = `${username}@gmail.com`;
  const password = generatePassword();
  const name = username.charAt(0).toUpperCase() + username.slice(1) + " Server";

  const { egg, nestid, loc, domain, apikey } = global;

  const resourceMap = {
    '1gb': { ram: "1000", disk: "1000", cpu: "40" },
    '2gb': { ram: "2000", disk: "1000", cpu: "60" },
    '3gb': { ram: "3000", disk: "2000", cpu: "80" },
    '4gb': { ram: "4000", disk: "2000", cpu: "100" },
    '5gb': { ram: "5000", disk: "3000", cpu: "120" },
    '6gb': { ram: "6000", disk: "3000", cpu: "140" },
    '7gb': { ram: "7000", disk: "4000", cpu: "160" },
    '8gb': { ram: "8000", disk: "4000", cpu: "180" },
    '9gb': { ram: "9000", disk: "5000", cpu: "200" },
    '10gb': { ram: "10000", disk: "5000", cpu: "220" },
    'unlimited': { ram: "0", disk: "0", cpu: "0" },
    'unli': { ram: "0", disk: "0", cpu: "0" }
  };

  const { ram, disk, cpu } = resourceMap[command.toLowerCase()] || { ram: "0", disk: "0", cpu: "0" };

  try {
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      },
      body: JSON.stringify({
        email,
        username,
        first_name: name,
        last_name: "Server",
        language: "en",
        password
      })
    });

    const userJson = await userRes.json();
    if (userJson.errors) return m.reply("Error create user: " + JSON.stringify(userJson.errors[0], null, 2));
    const user = userJson.attributes;

    const eggRes = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      }
    });

    const eggJson = await eggRes.json();
    const startup_cmd = eggJson.attributes.startup;

    const serverRes = await fetch(`${domain}/api/application/servers`, {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + apikey
      },
      body: JSON.stringify({
        name,
        description: new Date().toLocaleString('id-ID'),
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
        startup: startup_cmd,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start"
        },
        limits: { memory: ram, swap: 0, disk, io: 500, cpu },
        feature_limits: { databases: 5, backups: 5, allocations: 5 },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: []
        }
      })
    });

    const serverJson = await serverRes.json();
    if (serverJson.errors) return m.reply("Error create server: " + JSON.stringify(serverJson.errors[0], null, 2));
    const server = serverJson.attributes;

    const teks = `
*Berikut Detail Akun Panel Kamu 📦*

📡 *ID Server:* ${server.id}
👤 *Username:* ${user.username}
🔐 *Password:* ${password}
📅 *Tanggal:* ${new Date().toLocaleString('id-ID')}

🌐 *Spesifikasi Server*
• Ram: ${ram == "0" ? "Unlimited" : ram / 1000 + "GB"}
• Disk: ${disk == "0" ? "Unlimited" : disk / 1000 + "GB"}
• CPU: ${cpu == "0" ? "Unlimited" : cpu + "%"}
• Panel: ${domain}

⚠️ *Syarat & Ketentuan*
• Expired panel 1 bulan
• Simpan data ini sebaik mungkin
• Garansi 15 hari (1x replace)
• Claim garansi wajib bawa bukti chat
`.trim();

    const msg = {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Tekan tombol untuk salin data login." }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "Salin Username",
                copy_code: user.username
              })
            },
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "Salin Password",
                copy_code: password
              })
            }
          ]
        })
      })
    };

    await conn.relayMessage(nomor, msg, { messageId: m.key.id });

    if (!nom && m.chat.endsWith('@g.us')) {
      await m.reply(`Akun panel berhasil dibuat dan dikirim ke *private chat kamu!* ✅`);
    } else if (nom && nomor !== m.chat) {
      await m.reply(`Akun panel berhasil dibuat dan dikirim ke *${nomor.split("@")[0]}* ✅`);
    }
  } catch (err) {
    return m.reply("Terjadi kesalahan: " + err.message);
  }
};

handler.command = /^(1gb|2gb|3gb|4gb|5gb|6gb|7gb|8gb|9gb|10gb|unlimited|unli)$/i;
handler.tags = ['panel'];
handler.help = ['1gb', '2gb', '3gb', '4gb', '5gb', '6gb', '7gb', '8gb', '9gb', '10gb', 'unlimited', 'unli'].map(v => v + ' <username>[,nomor]');
handler.owner = true
handler.premium = true


export default handler;