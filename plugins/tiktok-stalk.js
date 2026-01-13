/*
Jangan Haus Wm Bang 

*Tiktok Stalk Plugins Esm*

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*
https://whatsapp.com/channel/0029Vaf07jKCBtxAsekFFk3i
*/

import axios from 'axios';
import cheerio from 'cheerio';

async function tiktokStalk(username) {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}?_t=ZS-8tHANz7ieoS&_r=1`);
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        const parsedData = JSON.parse(scriptData);

        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];
        if (!userDetail) {
            throw new Error('User tidak ditemukan');
        }

        const userInfo = userDetail.userInfo?.user;
        const stats = userDetail.userInfo?.stats;

        const metadata = {
            username: userInfo?.uniqueId || null,
            nama: userInfo?.nickname || null,
            bio: userInfo?.signature || null,
            verifikasi: userInfo?.verified || false,
            totalfollowers: stats?.followerCount || 0,
            totaldisukai: stats?.heart || 0,
            totalvideo: stats?.videoCount || 0,
            avatar: userInfo?.avatarLarger || null,
        };

        return metadata;
    } catch (error) {
        return { error: error.message };
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Harap masukkan username TikTok!');
    const result = await tiktokStalk(text);

    if (result.error) {
        return m.reply(`Error: ${result.error}`);
    }

    const { username, nama, bio, verifikasi, totalfollowers, totaldisukai, totalvideo, avatar } = result;

    const message = `*Username*: ${username || '-'}\n*Nama*: ${nama || '-'}\n*Bio*: ${bio || '-'}\n*Terverifikasi*: ${verifikasi ? 'Ya' : 'Tidak'}\n*Total Followers*: ${totalfollowers.toLocaleString()}\n*Total Like*: ${totaldisukai.toLocaleString()}\n*Total Video*: ${totalvideo.toLocaleString()}`;

    await conn.sendMessage(m.chat, { image: { url: avatar }, caption: message });
};

handler.help = ['ttstalk'].map(v => v + ' <username>');
handler.tags = ["stalk"]
handler.command = /^(ttstalk)$/i;
handler.limit = false;

export default handler;