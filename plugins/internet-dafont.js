/*
Author : Reza[RezoytOFFICIAL]
Fitur : Dafont
Api by : Crafters team
Sumber : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
#JANGANDIHAPUS
*/

import fetch from 'node-fetch';

let handler = async (m, { text, conn }) => {
  if (!text) throw 'Masukkan nama font yang ingin dicari!\nContoh: .dafont coolvetica';

  const url = `https://api.crafters.biz.id/search/dafont?text=${encodeURIComponent(text)}`;

  try {
    let res = await fetch(url);
    if (!res.ok) throw 'Gagal mengambil data dari API';

    let json = await res.json();
    if (!json.status || !json.result || json.result.length === 0) throw 'Font tidak ditemukan!';

    let font = json.result[0];
    let caption = `*Judul:* ${font.title}
*Kategori:* ${font.category}
*Lisensi:* ${font.license}
*Unduhan:* ${font.downloads}
*Link Unduh:* ${font.downloadUrl}`;

    await conn.sendFile(m.chat, font.previewUrl, 'preview.png', caption, m);
  } catch (e) {
    console.error(e);
    throw typeof e === 'string' ? e : (e.message || 'Terjadi kesalahan saat mengambil font');
  }
};

handler.help = ['dafont <nama>'];
handler.tags = ['internet'];
handler.command = /^dafont$/i;

export default handler;