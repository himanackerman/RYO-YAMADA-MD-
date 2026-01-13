import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, {
    conn,
    usedPrefix,
    command,
    args
}) => {
    const kota = args[0]?.toLowerCase() || 'jakarta';
    try {
        const {
            data
        } = await axios.get(`https://jadwal-sholat.tirto.id/kota-${kota}`);
        const $ = cheerio.load(data);

        const jadwal = $('tr.currDate td').map((i, el) => $(el).text()).get();

        if (jadwal.length === 7) {
            const [tanggal, subuh, duha, dzuhur, ashar, maghrib, isya] = jadwal;

            const zan = `
  [ *Jadwal Sholat* ]
᎒⊸ *Kota*: ${kota.charAt(0).toUpperCase() + kota.slice(1)}
᎒⊸ *Tanggal*: ${tanggal}

  [ *Waktu Sholat* ]
᎒⊸ Subuh: ${subuh}
᎒⊸ Duha: ${duha}
᎒⊸ Dzuhur: ${dzuhur}
᎒⊸ Ashar: ${ashar}
᎒⊸ Maghrib: ${maghrib}
᎒⊸ Isya: ${isya}
`;

            await conn.reply(m.chat, zan, m);
        } else {
            await conn.reply(m.chat, 'Jadwal sholat tidak ditemukan. Pastikan nama kota sesuai.', m);
        }
    } catch (error) {
        await conn.reply(m.chat, 'error', m);
    }
};

handler.help = ['jadwalsholat kota'];
handler.tags = ['internet'];
handler.command = ['jadwalsholat', 'sholat'];
handler.register = false;
export default handler;