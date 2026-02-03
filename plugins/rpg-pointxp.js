let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender];
  if (!user) throw "Data pengguna tidak ditemukan. Pastikan Anda terdaftar!";

  // Periksa argumen
  if (!args[0]) return m.reply("Gunakan format: `.expoint [type]|[jumlah]`\nContoh: `.expoint mana|1`");
  const [type, jumlahStr] = args[0].split('|');
  if (!type || !jumlahStr) return m.reply("Format salah. Gunakan format `.expoint [type]|[jumlah]`.");

  let jumlah = parseInt(jumlahStr);
  if (isNaN(jumlah) || jumlah <= 0) return m.reply("Jumlah harus berupa angka positif.");

  // Daftar jenis poin yang dapat dibeli
  const validTypes = ['mana', 'health', 'stamina'];
  if (!validTypes.includes(type)) return m.reply(`Tipe tidak valid. Pilih salah satu: ${validTypes.join(', ')}`);

  // Harga per poin (ubah sesuai kebutuhan)
  const pricePerPoint = 100; // Harga per poin
  const totalCost = jumlah * pricePerPoint;

  // Periksa apakah pengguna memiliki cukup uang
  if (user.money < totalCost) {
    return m.reply(`Uang kamu tidak cukup! Kamu butuh Rp ${new Intl.NumberFormat('id-ID').format(totalCost)} untuk membeli ${jumlah} ${type}.`);
  }

  // Proses pembelian
  user.money -= totalCost;
  user[type] = (user[type] || 0) + jumlah;

  // Balasan berhasil
  m.reply(`Pembelian berhasil! Kamu membeli ${jumlah} ${type} seharga Rp ${new Intl.NumberFormat('id-ID').format(totalCost)}.\nSaldo tersisa: Rp ${new Intl.NumberFormat('id-ID').format(user.money)}.`);
};

handler.help = ['expoint'];
handler.tags = ['rpg'];
handler.command = /^expoint$/i;

export default handler;