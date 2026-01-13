const orders = {
  '3': { name: '3 Day Premium', price: 'Rp. 3.000' },
  '7': { name: '7 Day Premium', price: 'Rp. 10.000' },
  '30': { name: '30 Day Premium', price: 'Rp. 15.000' },
  '60': { name: '60 Day Premium', price: 'Rp. 30.000' },
  '90': { name: '90 Day Premium', price: 'Rp. 40.000' },
  '365': { name: '365 Day Premium', price: 'Rp. 115.000' },
  'G7': { name: '7 Day Join Group', price: 'Rp. 2.000' },
  'G30': { name: '30 Day Join Group', price: 'Rp. 5.000' },
  'G365': { name: '365 Day Join Group', price: 'Rp. 80.000' },
};

let handler = async (m, { conn, text }) => {
  // kalau ga ada input kode, kirim list paket
  if (!text) {
    let listText = '*📦 Daftar Paket Premium / Sewa:*\n\n';
    for (let k in orders) {
      listText += `• *${k}* → ${orders[k].name} — ${orders[k].price}\n`;
    }
    listText += `\nKetik *.order <kode>* untuk pesan.\nContoh: *.order 7*`;
    await m.reply(listText);
    return;
  }

  let code = text.trim().toUpperCase();
  if (!orders[code]) {
    return m.reply('❌ Kode paket tidak ditemukan.\nKetik *.order* untuk lihat daftar.');
  }

  // data paket
  let paket = orders[code];
  let orderMsg = `📢 *ORDER PREMIUM*\n\n👤 Nama: ${m.pushName}\n📱 Nomor: wa.me/${m.sender.split('@')[0]}\n📦 Paket: ${paket.name}\n💰 Harga: ${paket.price}\n⏰ Tanggal: ${new Date().toLocaleString('id-ID')}`;

  // kirim ke user
  await m.reply(`✅ Pesanan kamu:\n\n${orderMsg}\n\n📩 Pesanan ini akan dikirim ke Owner.`);

  // kirim ke owner
  let owner = global.nomorOwner || '628xxx'; // isi default kalau belum di set
  await conn.sendMessage(owner + '@s.whatsapp.net', { text: orderMsg });
};

handler.help = ['order <kode>'];
handler.tags = ['main'];
handler.command = /^order|sewa|premium$/i;
export default handler;