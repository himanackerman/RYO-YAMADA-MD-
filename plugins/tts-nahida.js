import fetch from 'node-fetch';

let handler = async (m, { text, conn, command }) => {
  if (!text) throw `Kirim teks yang ingin diubah jadi suara Nahida!\n\nContoh: .${command} Halo Hilman!`

  let res = await fetch(`https://www.sankavolereii.my.id/anime/ttsnahida?apikey=planaai&text=${encodeURIComponent(text)}`);
  if (!res.ok) throw `Gagal ambil audio: ${res.statusText}`

  let buffer = await res.buffer();

  await conn.sendFile(m.chat, buffer, 'nahida.mp3', `✅ Berikut suara Nahida:\n${text}`, m, false, { mimetype: 'audio/mp4' });
}
handler.help = ['ttsnahida <teks>']
handler.tags = ['voice']
handler.command = /^ttsnahida$/i
handler.limit = true

export default handler