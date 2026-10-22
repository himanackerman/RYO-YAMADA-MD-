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

  const femboyLevel = Math.floor(Math.random() * 101);
  
  const femboyStatus = femboyLevel < 20 ? 'Giga Chad Shounen' : 
                       femboyLevel < 40 ? 'Karakter Sampingan Mencurigakan' : 
                       femboyLevel < 60 ? 'Trap Magang Otaku' : 
                       femboyLevel < 80 ? 'Spek Waifu Berjakun' : 
                       'Kloning Legendaris Astolfo';
  
  const deskripsi = femboyLevel < 20 ? 'Aman, aura lakinya masih sekuat karakter utama shounen. Gak mempan dikasih baju maid atau rok mini.' : 
                    femboyLevel < 40 ? 'Mulai ada bakat terpendam. Diam-diam suka merhatiin karakter trap di anime dan mikir "kalau cowok imut gini boleh juga".' :
                    femboyLevel < 60 ? 'Sudah masuk fase rawan. Suaranya kalau di-voice note bisa mengecoh satu grup chat, hobi pakai hoodie kedodoran biar kelihatan mungil.' :
                    femboyLevel < 80 ? 'Level Felix Argyle! Punya paha mulus tanpa bulu, jago pose "peace" miring, dan kalau pakai wig langsung bikin cowok tulen meragukan orientasinya.' :
                    'YAMETEEE!!! Ini adalah puncak kejayaan dunia per-femboyan. Setara Astolfo dan Venti, tingkat keimutannya melampaui waifu asli sampai bisa bikin bapak-bapak khilaf!';

  const pesan = `— DETEKSI FEMBOY —

🎀 *Nama Target:* ${nama}

🌸 *Level Imut/Trap:* ${femboyLevel}%

🎐 *Kasta Karakter:* ${femboyStatus}

📌 *Analisis:* "${deskripsi}"
`;

  await conn.sendMessage(m.chat, { 
    text: pesan, 
    mentions: target ? [target] : [] 
  }, { quoted: m });
};

handler.help = ['cekfemboy'];
handler.tags = ['fun'];
handler.command = /^(cek)?femboy$/i;
handler.limit = true;
handler.register = true;

export default handler;