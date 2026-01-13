import { proto } from "@adiwajshing/baileys";

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // pastikan db store ada
    if (!global.db.data.msgs) global.db.data.msgs = {};
    let msgs = global.db.data.msgs;

    if (!text) 
        throw `Penggunaan: ${usedPrefix + command} <nama>\n\nContoh:\n${usedPrefix + command} tes`;

    let key = text.trim().toLowerCase();

    if (key in msgs) 
        throw `[${text}] Telah Terdaftar Di List Store`;

    if (m.quoted) {
        // simpan pesan yang dibalas
        msgs[key] = proto.WebMessageInfo.fromObject(await m.getQuotedObj()).toJSON();
        return m.reply(`✅ Berhasil menambahkan "${text}" ke Store dari pesan yang dibalas.`);
    } else {
        // simpan teks langsung
        msgs[key] = { text: text };
        return m.reply(`✅ Berhasil menambahkan "${text}" ke Store sebagai teks.`);
    }
};

handler.help = ["addstore"];
handler.tags = ["store"];
handler.command = ["addstore"];
handler.owner = true;

export default handler;