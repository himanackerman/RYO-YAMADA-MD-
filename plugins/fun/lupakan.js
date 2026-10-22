import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const quotes = [
    'Masa lalu adalah pelajaran, bukan penjara. Biarkan dirimu terbang lebih tinggi.',
    'Setiap hari adalah kesempatan baru untuk menjadi versi terbaik dari dirimu.',
    'Jangan biarkan kemarin mengambil terlalu banyak dari hari ini.',
    'Lupakan apa yang tidak bisa diubah, fokus pada apa yang bisa kamu lakukan sekarang.',
    'Kehidupan terlalu singkat untuk menyimpan dendam dan penyesalan.',
    'Masa depan menunggu mereka yang berani meninggalkan masa lalu.',
    'Kesalahan adalah guru terbaik, bukan musuh. Belajar dan lanjutkan.',
    'Kamu tidak bisa mengubah masa lalu, tapi kamu bisa membentuk masa depan.',
    'Setiap detik adalah kesempatan untuk memulai ulang.',
    'Lepaskan beban masa lalu dan rasakan kebebasan sejati.',
    'Hidup dimulai ketika kamu berhenti memikirkan apa yang seharusnya terjadi.',
    'Masa lalu tidak mendefinisikan siapa kamu, pilihan hari ini yang melakukannya.',
    'Jangan terjebak dalam cerita lama, tulis cerita baru yang lebih indah.',
    'Keberanian bukan tidak takut, tapi melangkah maju meski takut.',
    'Setiap orang berhak mendapatkan kesempatan kedua, termasuk dirimu sendiri.'
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  const message = `— lupakan masa lalu —

❀ motivasi :
${randomQuote}

Ingat, kamu lebih kuat dari yang kamu pikirkan. Masa depan penuh dengan kemungkinan tak terbatas! 💪✨`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['lupakan'];
handler.tags = ['fun'];
handler.command = /^lupakan$/i;
handler.limit = true;
handler.register = true;

export default handler;