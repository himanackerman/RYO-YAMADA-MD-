import axios from "axios";
import fs from "fs/promises";

async function getToken(url) {
  try {
    const response = await axios.get(url);
    const cookies = response.headers["set-cookie"];
    const joinedCookies = cookies ? cookies.join("; ") : null;

    const csrfTokenMatch = response.data.match(/<meta name="csrf-token" content="(.*?)">/);
    const csrfToken = csrfTokenMatch ? csrfTokenMatch[1] : null;

    if (!csrfToken || !joinedCookies) {
      throw new Error("Gagal mendapatkan CSRF token atau cookie.");
    }

    return { csrfToken, joinedCookies };
  } catch (error) {
    console.error("❌ Error fetching cookies or CSRF token:", error.message);
    throw error;
  }
}

async function mlStalk(userId, zoneId) {
  try {
    const { csrfToken, joinedCookies } = await getToken("https://www.gempaytopup.com");

    const payload = {
      uid: userId,
      zone: zoneId,
    };

    const { data } = await axios.post(
      "https://www.gempaytopup.com/stalk-ml",
      payload,
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
          Cookie: joinedCookies,
        },
      }
    );

    return data;
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Response:", error.response?.data || "No response data");
  }
}

// Handler untuk command
const handler = async (m, { conn, text }) => {
  const [userId, zoneId] = text.split(' '); // Mengambil userId dan zoneId dari query

  if (!userId || !zoneId) {
    return m.reply("Silakan masukkan userId dan zoneId. Contoh: .mlstalk 12345678 1234");
  }

  const result = await mlStalk(userId, zoneId);
  
  if (result) {
    // Format hasil yang lebih rapi
    const formattedResult = `
Username: ${result.username || 'Tidak tersedia'}
Region: ${result.region || 'Tidak tersedia'}
Success: ${result.success ? 'Ya' : 'Tidak'}
    `;

    // Ganti 'https://link.to/your/image.jpg' dengan URL gambar yang ingin Anda kirim
    const imageUrl = 'https://www.pic.surf/2kk'; 

    // Mengirim gambar dari URL dan hasil dalam satu pesan
    await conn.sendFile(m.chat, imageUrl, 'image.jpg', `Hasil Stalk:\n${formattedResult}`, m);
  } else {
    m.reply("Gagal mendapatkan data.");
  }
};

handler.help = ['mlstalk <userId> <zoneId>'];
handler.tags = ["stalk"];
handler.command = /^(mlstalk)$/i;
handler.limit = false;

export default handler;