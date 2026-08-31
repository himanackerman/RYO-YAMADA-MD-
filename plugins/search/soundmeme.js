/**
 • Fitur By Anomaki Team
 • Created : Nazand Code 
 • Jangan Hapus Wm
 • SEARCH AUTO KIRIM SOUND MEME | SEARCH LIST NAMA SOUND MEME | RANDOM SOUND MEME
 • https://whatsapp.com/channel/0029Vaio4dYC1FuGr5kxfy2l
**/

import axios from 'axios';
import * as cheerio from 'cheerio';

let handler = async (m, {
    conn,
    text,
    command
}) => {
    const baseUrl = 'https://www.myinstants.com/en/search/?name=';

    if (command === 'soundmeme-listnama') {
        if (!text) {
            return m.reply('Silakan masukkan nama suara untuk DICARI.');
        }

        const url = `${baseUrl}${encodeURIComponent(text)}`;

        try {
            const {
                data
            } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
                }
            });

            const $ = cheerio.load(data);

            const instants = $('div.instant');

            if (instants.length === 0) {
                return m.reply('Suara tidak ditemukan dengan nama tersebut.');
            }

            let list = '';
            instants.each((index, element) => {
                const soundName = $(element).find('.instant-link').text().trim();
                list += `${index + 1}. ${soundName}\n`;
            });

            m.reply(`noh ada:\n\n• ${list || 'Tidak ada sound meme.'}`);

        } catch (err) {
            console.error(err);
            m.reply('Terjadi kesalahan saat mengambil suara.');
        }
    } else if (command === 'soundmeme-random') {
        const url = 'https://www.myinstants.com/en/index/id/';

        try {
            const {
                data
            } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
                }
            });

            const $ = cheerio.load(data);

            const randomInstant = $('div.instant').eq(Math.floor(Math.random() * $('div.instant').length));

            const audioUrl = `https://www.myinstants.com${randomInstant.find('button').attr('onclick').match(/'([^']+)'/)[1]}`;

            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'arraybuffer'
            });

            const contentType = response.headers['content-type'];
            let mimetype = 'audio/mpeg';

            if (contentType.includes('mp3')) {
                mimetype = 'audio/mp3';
            } else if (contentType.includes('ogg')) {
                mimetype = 'audio/ogg';
            } else if (contentType.includes('wav')) {
                mimetype = 'audio/wav';
            }

            await conn.sendMessage(m.chat, {
                audio: response.data,
                mimetype: mimetype,
                ptt: false
            }, {
                quoted: m
            });

        } catch (err) {
            console.error(err);
            m.reply('Terjadi kesalahan saat mengambil suara.');
        }
    } else if (command === 'soundmeme-search') {
        if (!text) {
            return m.reply('nama?.');
        }

        const url = `${baseUrl}${encodeURIComponent(text)}`;

        try {
            const {
                data
            } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
                }
            });

            const $ = cheerio.load(data);

            const instants = $('div.instant');

            if (instants.length === 0) {
                return m.reply('Suara tidak ditemukan dengan nama tersebut.');
            }

            let closestMatch = '';
            let bestMatchScore = 0;

            instants.each((index, element) => {
                const soundName = $(element).find('.instant-link').text().trim();
                const score = soundName.toLowerCase().includes(text.toLowerCase()) ? 1 : 0;

                if (score > bestMatchScore) {
                    bestMatchScore = score;
                    closestMatch = soundName;
                }
            });

            if (closestMatch) {
                const audioUrl = `https://www.myinstants.com${$('div.instant').find('button').attr('onclick').match(/'([^']+)'/)[1]}`;

                const response = await axios({
                    url: audioUrl,
                    method: 'GET',
                    responseType: 'arraybuffer'
                });

                const contentType = response.headers['content-type'];
                let mimetype = 'audio/mpeg';

                if (contentType.includes('mp3')) {
                    mimetype = 'audio/mp3';
                } else if (contentType.includes('ogg')) {
                    mimetype = 'audio/ogg';
                } else if (contentType.includes('wav')) {
                    mimetype = 'audio/wav';
                }

                await conn.sendMessage(m.chat, {
                    audio: response.data,
                    mimetype: mimetype,
                    ptt: false
                }, {
                    quoted: m
                });

            } else {
                m.reply('Tidak ada suara yang mendekati nama yang di cari.');
            }

        } catch (err) {
            console.error(err);
            m.reply('Terjadi kesalahan saat mengambil suara.');
        }
    }
};

handler.command = /^soundmeme2/i;
handler.help = ['soundmeme-listnama nama', 'soundmeme-random', 'soundmeme-search nama'];
handler.tags = ['search', 'fun'];
handler.limit = false
export default handler;