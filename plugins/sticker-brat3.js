import { createCanvas } from 'canvas';
import Jimp from 'jimp';
import { Sticker } from 'wa-sticker-formatter';

async function BratGenerator(teks) {
  let width = 512;
  let height = 512;
  let margin = 20;
  let wordSpacing = 50;

  let canvas = createCanvas(width, height);
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  let fontSize = 80;
  let lineHeightMultiplier = 1.3;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';

  let words = teks.split(' ');
  let lines = [];

  let rebuildLines = () => {
    lines = [];
    let currentLine = '';

    for (let word of words) {
      let testLine = currentLine ? `${currentLine} ${word}` : word;
      let lineWidth =
        ctx.measureText(testLine).width + (currentLine.split(' ').length - 1) * wordSpacing;

      if (lineWidth < width - 2 * margin) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  };

  ctx.font = `${fontSize}px Sans-serif`;
  rebuildLines();

  while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Sans-serif`;
    rebuildLines();
  }

  let lineHeight = fontSize * lineHeightMultiplier;
  let y = margin;

  for (let line of lines) {
    let wordsInLine = line.split(' ');
    let x = margin;

    for (let word of wordsInLine) {
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + wordSpacing;
    }

    y += lineHeight;
  }

  let buffer = canvas.toBuffer('image/png');
  let image = await Jimp.read(buffer);

  image.blur(3);
  let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

  return blurredBuffer;
}

let handler = async (m, { text, conn }) => {
  if (!text) return m.reply('Gunakan perintah ini dengan format: brat <teks>');

  try {
    conn.sendMessage(m.chat, { react: { text: '🌿', key: m.key } });

    let img = await BratGenerator(text);

    let sticker = new Sticker(img, {
      pack: 'Stiker By',
      author: 'Ryo Yamada',
      type: 'image/png',
    });

    let stikerBuffer = await sticker.toBuffer();
    await conn.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m });
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, 'Maaf, terjadi kesalahan saat membuat stiker brat.', m);
  }
};

handler.help = ['brat3'];
handler.command = ['brat3'];
handler.tags = ['sticker']
handler.premium = false
handler.limit = true 

export default handler;