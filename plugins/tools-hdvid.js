import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!/video/g.test(mime)) {
        return m.reply(`Reply ke video yang ingin diubah ke HD dengan caption *${usedPrefix + command}*`);
    }

    m.reply(global.wait);

    let media = await q.download();
    let inputPath = './tmp/input.mp4';
    let outputPath = './tmp/output.mp4';

    if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp');
    }

    fs.writeFileSync(inputPath, media);

    try {
        const ffmpegCommand = `ffmpeg -i ${inputPath} -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart ${outputPath}`;

        await execPromise(ffmpegCommand);

        let videoResult = fs.readFileSync(outputPath);

        await conn.sendFile(m.chat, videoResult, 'aslisunda.mp4', 'done', m);

    } catch (e) {
        console.error(e);
        m.reply('plis to install FFmpeg');
    } finally {
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
    }
};

handler.help = ['hdvid', 'hdvideo'];
handler.command = ['hdvid', 'hdvideo'];
handler.tags = ['tools'];
handler.limit = true;
handler.premium = true;

export default handler;