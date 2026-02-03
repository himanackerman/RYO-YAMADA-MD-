/*
Jangan Haus Wm Bang 

*Sticker ttp/attp Plugins Esm*

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*
Lupa Dapat Dimana Yang Merasa Punya Skrep Nya Pm Aja 🗿
*/

import { createCanvas } from 'canvas';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

async function create_frame(text, color, pathna) {
  const width = 400;
  const height = 400;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, width, height);

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test_line;
    }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;

  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(pathna, buffer);
}

async function create_attp(text) {
  const lokasina = path.join(process.cwd(), 'temp_frames');
  if (!fs.existsSync(lokasina)) fs.mkdirSync(lokasina);

  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
  const fpaths = [];

  for (let i = 0; i < colors.length; i++) {
    const fpath = path.join(lokasina, `frame_${i}.png`);
    await create_frame(text, colors[i], fpath);
    fpaths.push(fpath);
  }

  return new Promise((resolve, reject) => {
    const output_webp = path.join(process.cwd(), 'attp.webp');
    const ffmpeg_cmd = `ffmpeg -y -framerate 10 -i ${lokasina}/frame_%d.png -vf "scale=512:512:flags=lanczos" -vcodec libwebp -lossless 1 -loop 0 -an -vsync 0 ${output_webp}`;
    
    exec(ffmpeg_cmd, (error) => {
      fpaths.forEach((file) => fs.unlinkSync(file));
      fs.rmdirSync(lokasina);

      if (error) return reject(error);

      const buffna = fs.readFileSync(output_webp);
      fs.unlinkSync(output_webp);
      resolve(buffna);
    });
  });
}

async function create_ttp(text) {
  const width = 400;
  const height = 400;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, width, height);

  let fsize = 80;
  if (text.length > 10) fsize = 60;
  if (text.length > 20) fsize = 40;

  ctx.font = `bold ${fsize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const test_line = line + word + ' ';
    const test_width = ctx.measureText(test_line).width;
    if (test_width > width - 40) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = test_line;
    }
  });
  lines.push(line.trim());

  const total_height = lines.length * fsize;
  let startY = (height - total_height) / 2 + fsize / 2;

  lines.forEach((line) => {
    ctx.fillText(line, width / 2, startY);
    startY += fsize;
  });

  const buffer = canvas.toBuffer('image/png');
  const output_webp = path.join(process.cwd(), 'ttp.webp');

  return new Promise((resolve, reject) => {
    const ffmpeg_cmd = `ffmpeg -i pipe:0 -vcodec libwebp -lossless 1 -loop 0 -an -vsync 0 -s 512x512 ${output_webp}`;
    const proc = exec(ffmpeg_cmd, (error) => {
      if (error) return reject(error);

      const buffna = fs.readFileSync(output_webp);
      fs.unlinkSync(output_webp);
      resolve(buffna);
    });

    proc.stdin.write(buffer);
    proc.stdin.end();
  });
}

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('Mana Text Nya ?');

  try {
    if (command === 'ttp') {
      const buffer = await create_ttp(text);
      await conn.sendMessage(m.chat, { sticker: buffer });
    } else if (command === 'attp') {
      const buffer = await create_attp(text);
      await conn.sendMessage(m.chat, { sticker: buffer });
    } else {
      m.reply('Perintah tidak valid.');
    }
  } catch (e) {
    console.error(e);
    m.reply('Terjadi kesalahan saat memproses permintaan Anda.');
  }
};

handler.help = ['ttp', 'attp'];
handler.command = /^(ttp|attp)$/i;
handler.tags = ["sticker"]
handler.limit = false;

export default handler;