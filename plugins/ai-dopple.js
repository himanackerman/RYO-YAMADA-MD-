/*
Jangan Hapus Wm Bang 

*Dopple Ai  Plugins Esm*


*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://github.com/LeooxzyDekuu/HanakoBotz/blob/main/scrapers/src/DoppleAi.js

*/

import fetch from "node-fetch";
import { translate } from "bing-translate-api";

async function DoppleAi(prompt) {
    const url = "https://beta.dopple.ai/api/messages/send";
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
        Referer: "https://beta.dopple.ai/messages",
    };
    const body = JSON.stringify({
        streamMode: "none",
        chatId: "632cef078c294913b5b4653869eca845",
        folder: "",
        images: false,
        username: "mn0uvp2fhv",
        persona_name: "",
        id: "46db0561-cb3e-43d9-8f50-40b3e3c84713",
        userQuery: prompt,
    });

    try {
        const response = await fetch(url, { method: "POST", headers, body });
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error:", error);
        return "Maaf, ada kesalahan dalam mengambil respons.";
    }
}

async function translateToIndonesian(text) {
    try {
        const result = await translate(text, null, "id");
        return result.translation;
    } catch (error) {
        console.error("Error saat menerjemahkan:", error);
        return text;
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Masukkan pertanyaan untuk AI!");
    let aiResponse = await DoppleAi(text);
    let translatedResponse = await translateToIndonesian(aiResponse);

    let message = {
        image: { url: "https://img5.pixhost.to/images/2852/566434342_senjudzz.jpg" },
        caption: translatedResponse,
        quoted: m
    };

    conn.sendMessage(m.chat, message);
};

handler.help = ['dopple'];
handler.tags = ['ai']
handler.command = ['dopple'];
handler.limit = true;
handler.register = true 
export default handler;