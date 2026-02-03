const handler = async (m, { conn, mess }) => {
  if (!m.isGroup) return m.reply(mess.group);

  const participants = await conn.groupMetadata(m.chat).then(res => res.participants);

  let countIndonesia = 0;
  let countMalaysia = 0;
  let countUSA = 0;
  let countOther = 0;

  for (const p of participants) {
    const phone = p.id.split('@')[0];
    if (phone.startsWith("62")) countIndonesia++;
    else if (phone.startsWith("60")) countMalaysia++;
    else if (phone.startsWith("1")) countUSA++;
    else countOther++;
  }

  const msg = `Jumlah Anggota Grup Berdasarkan Negara:

• Indonesia: ${countIndonesia} 🇮🇩
• Malaysia: ${countMalaysia} 🇲🇾
• USA: ${countUSA} 🇺🇸
• Lainnya: ${countOther} 🌍`;

  m.reply(msg);
};

handler.help = ['cekasalmember'];
handler.tags = ['group'];
handler.command = /^cekasalmember$/i;
handler.group = true

export default handler;