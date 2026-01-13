/* fitur brat button 
follow bang https://whatsapp.com/channel/0029Vb69G8eE50UgA7ZlyV1Q
© rijalganzz not sepuh
type esm plugins ya bang 
tinggal sesuaikan sama punya mu
*/
import { Sticker } from 'wa-sticker-formatter';

let handler = async (m, { conn, text }) => {
    let teksMasukan = m.quoted?.text || text || '';
    if (!teksMasukan) return m.reply('Balas pesan atau berikan teks.');

    try {
        const buttonMessage = {
            text: teksMasukan,
            footer: 'Pilih tombol di bawah',
            buttons: [
                { buttonId: `.brat ${teksMasukan}`, buttonText: { displayText: 'Brat' }, type: 1 },
                { buttonId: `.bratvid ${teksMasukan}`, buttonText: { displayText: 'Brat Video' }, type: 1 },
                { buttonId: `.animebrat ${teksMasukan}`, buttonText: { displayText: 'Brat Anime' }, type: 1 }
            ],
            headerType: 1
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (error) {
        console.error('Kesalahan saat mengirim pesan tombol:', error);
        m.reply('Terjadi kesalahan. Silakan coba lagi.');
    }
};

handler.help = ['bratb'];
handler.tags = ['tools'];
handler.command = /^bratb$/i;

export default handler;