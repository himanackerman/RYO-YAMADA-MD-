import axios from 'axios';

async function ipLookup(query) {
    try {
        const response = await axios.get(`https://whoisjson.com/api/v1/whois?domain=${query}`, {
            headers: {
                'Authorization': 'Token=557187f3affef2235eb0ed83a407200a08450e81deb4adead2b278af003754ca' // Ganti dengan token Anda jika perlu
            }
        });

        // Ambil data dari respons
        const data = response.data;

        // Format hasil yang lebih rapi
        let result = '*Hasil Pencarian Domain:*\n\n';

        // Iterasi semua properti dari data dan tambahkan ke hasil
        for (const [key, value] of Object.entries(data)) {
            if (Array.isArray(value)) {
                result += `*${key.charAt(0).toUpperCase() + key.slice(1)}:* ${value.join(', ')}\n`;
            } else {
                result += `*${key.charAt(0).toUpperCase() + key.slice(1)}:* ${value || 'N/A'}\n`;
            }
        }

        return result;
    } catch (error) {
        console.log(error);
        return 'Error: ' + error.message;
    }
}

const handler = async (m, { command, text }) => {
    if (!text) {
        return m.reply('Silakan masukkan domain yang ingin dicari.');
    }

    const result = await ipLookup(text);
    m.reply(result);
};

handler.help = ['iplookup <domain>'];
handler.tags = ["internet"]
handler.command = /^(iplookup)$/i;
handler.limit = false;

export default handler;