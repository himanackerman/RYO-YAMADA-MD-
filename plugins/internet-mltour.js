import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// File untuk menyimpan data turnamen terakhir
const lastTournamentsFile = path.resolve('lastTournaments.json');

// Fungsi untuk menyimpan data turnamen terakhir
function saveLastTournaments(tournaments) {
    fs.writeFileSync(lastTournamentsFile, JSON.stringify(tournaments, null, 2));
}

// Fungsi untuk memuat data turnamen terakhir
function loadLastTournaments() {
    if (fs.existsSync(lastTournamentsFile)) {
        return JSON.parse(fs.readFileSync(lastTournamentsFile, 'utf-8'));
    }
    return [];
}

// Fungsi untuk mendapatkan turnamen terbaru
async function latestTourMobileLegends() {
    try {
        const { data } = await axios.get('https://infotourney.com/tournament/mobile-legends');
        const $ = cheerio.load(data);
        const tournaments = [];

        $('.items-row .item').each((index, element) => {
            const title = $(element).find('h2 a').text();
            const url = "https://infotourney.com" + $(element).find('h2 a').attr('href');
            const image = "https://infotourney.com" + $(element).find('img').attr('src');
            const startDate = $(element).find('.published time').attr('datetime');
            const startDateText = $(element).find('.published').text().trim();
            const registrationEndDateText = $(element).find('p').last().text().trim();
            const description = $(element).find('p').eq(1).text().trim();
            
            const tags = [];
            $(element).find('.tags a').each((i, tagElement) => {
                tags.push($(tagElement).text());
            });

            tournaments.push({
                title,
                url,
                image,
                startDate,
                startDateText,
                registrationEndDateText,
                description,
                tags
            });
        });

        return tournaments;
    } catch (error) {
        return error.message;
    }
}

// Fungsi untuk memeriksa dan mengirim turnamen baru ke semua grup
async function checkAndSendNewTournaments(conn) {
    const lastTournaments = loadLastTournaments();
    const currentTournaments = await latestTourMobileLegends();

    if (typeof currentTournaments === 'string') {
        console.error('Error fetching tournaments:', currentTournaments);
        return;
    }

    // Cari turnamen baru yang belum pernah dikirim
    const newTournaments = currentTournaments.filter(
        current => !lastTournaments.some(last => last.title === current.title)
    );

    if (newTournaments.length > 0) {
        // Simpan turnamen terbaru
        saveLastTournaments(currentTournaments);

        // Kirim ke semua grup
        const chats = await conn.groupFetchAllParticipating();
        const groupIds = Object.values(chats).map(chat => chat.id);

        for (const groupId of groupIds) {
            let message = '📢 *Ada Turnamen Mobile Legends Terbaru!* 📢\n\n';
            newTournaments.forEach((tournament, index) => {
                message += `*${index + 1}. ${tournament.title}*\n`;
                message += `📅 Mulai: ${tournament.startDateText}\n`;
                message += `⏳ Pendaftaran Berakhir: ${tournament.registrationEndDateText}\n`;
                message += `🔗 Link: ${tournament.url}\n`;
                message += `📝 Deskripsi: ${tournament.description}\n`;
                message += `🏷️ Tags: ${tournament.tags.join(', ')}\n\n`;
            });

            const imageUrl = 'https://telegra.ph/file/67eb0104002c519ac4d7a-51daf0d7d73df6cff1.jpg';
            await conn.sendMessage(groupId, { 
                image: { url: imageUrl }, 
                caption: message 
            });
        }
    }
}

// Handler untuk command manual
const handler = async (m, { conn }) => {
    const tournaments = await latestTourMobileLegends();
    if (typeof tournaments === 'string') {
        return m.reply(tournaments); // Jika terjadi error, kirim pesan error
    }

    // Batasi jumlah turnamen yang dikirim (min 5, max 10)
    const maxTournaments = 10;
    const minTournaments = 5;
    const slicedTournaments = tournaments.slice(0, Math.max(minTournaments, Math.min(maxTournaments, tournaments.length)));

    let message = '📢 *Daftar Turnamen Mobile Legends Terbaru* 📢\n\n';
    slicedTournaments.forEach((tournament, index) => {
        message += `*${index + 1}. ${tournament.title}*\n`;
        message += `📅 Mulai: ${tournament.startDateText}\n`;
        message += `⏳ Pendaftaran Berakhir: ${tournament.registrationEndDateText}\n`;
        message += `🔗 Link: ${tournament.url}\n`;
        message += `📝 Deskripsi: ${tournament.description}\n`;
        message += `🏷️ Tags: ${tournament.tags.join(', ')}\n\n`;
    });

    // Kirim gambar beserta pesan
    const imageUrl = 'https://telegra.ph/file/67eb0104002c519ac4d7a-51daf0d7d73df6cff1.jpg';
    await conn.sendMessage(m.chat, { 
        image: { url: imageUrl }, 
        caption: message 
    }, { quoted: m });
};

handler.help = ['mltour'].map(v => v + ' '); // Command help
handler.command = /^(mltour)$/i; // Command regex
handler.tags = ['internet']
handler.limit = false; // Tidak ada limit penggunaan

// Fungsi untuk menjalankan pengecekan turnamen baru secara berkala
export async function autoCheckNewTournaments(conn) {
    setInterval(async () => {
        await checkAndSendNewTournaments(conn);
    }, 60 * 60 * 1000); // Cek setiap 1 jam
}

export default handler;