const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null;
  let nama = '';

  if (target) {
    nama = '@' + target.split('@')[0];
  } else if (text) {
    nama = text.trim();
  } else {
    return m.reply(`Gunakan: ${usedPrefix}${command} <nama atau tag orangnya>`);
  }

  const jomokLevel = Math.floor(Math.random() * 101);
  
  const jomokStatus = jomokLevel < 20 ? 'Warga Normal (Mencurigakan)' : 
                      jomokLevel < 40 ? 'Selingkuhan Rehan Wangsaf' : 
                      jomokLevel < 60 ? 'Murid Tetap Ironi Ngawi' : 
                      jomokLevel < 80 ? 'Kloning Mas Rusdi' : 
                      'Duta Amba Ngawi (RAJA JOMOK)';
  
  const deskripsi = jomokLevel < 20 ? 'Masih suci, tapi hatinya bergetar kalau denger lagu "Dreambull". Hati-hati tertular virus hitam manis.' : 
                    jomokLevel < 40 ? 'Agak waras, tapi di galeri hp-nya minimal ada satu video Mas Rusdi lagi senyum misterius.' :
                    jomokLevel < 60 ? 'Setengah jomok, setengah manusia. Sering ngomong "Ahhhh tuchhh" kalau lagi sendirian di kamar.' :
                    jomokLevel < 80 ? 'Sudah murtad dari jalan yang lurus. Suka nyari spek mas-mas berkumis tipis pemegang kunci surga Ngawi.' :
                    'AMBATUKAM!!! Orang ini sudah mencapai maqam tertinggi kejomokan. Kulitnya mulai menggelap, manis, dan siap mendesah bersama Mas Amba di Ngawi!';

  const pesan = `— DETEKSI KADAR JOMOK NGAWI —

😈 *Nama Korban:* ${nama}

🔥 *Level Jomok:* ${jomokLevel}%

🗣️ *Status Sekte:* ${jomokStatus}

📌 *Analisis:* "${deskripsi}"
`;

  await conn.sendMessage(m.chat, { 
    text: pesan, 
    mentions: target ? [target] : [] 
  }, { quoted: m });
};

handler.help = ['jomok'];
handler.tags = ['fun'];
handler.command = /^jomok$/i;
handler.limit = true;
handler.register = true;

export default handler;