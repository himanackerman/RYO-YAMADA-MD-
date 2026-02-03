import similarity from 'similarity';
const threshold = 0.72;

let handler = m => m;

handler.before = async function (m) {
    let id = m.chat;

    // Memastikan bahwa pesan yang diterima memiliki format yang benar
    if (!m.quoted || !m.quoted.fromMe || !/Ketik.*wa/i.test(m.quoted.text)) return !0;

    this.tebakanime = this.tebakanime ? this.tebakanime : {};

    // Menyediakan tanggapan jika soal telah berakhir
    if (!(id in this.tebakanime)) return m.reply('Soal Itu Telah Berakhir !');

    // Memeriksa apakah ID pesan yang dikutip sesuai
    if (m.quoted.id === this.tebakanime[id][0].id) {
        let json = JSON.parse(JSON.stringify(this.tebakanime[id][1]));

        // Menyemak jawaban pengguna
        if (m.text.toLowerCase() === json.jawaban.toLowerCase()) {
            global.db.data.users[m.sender].exp += this.tebakanime[id][2];
            await this.reply(m.chat, `*🎉Benar!* 💥+${this.tebakanime[id][2]} XP`, m);
            clearTimeout(this.tebakanime[id][3]);
            delete this.tebakanime[id];
        } else if (similarity(m.text.toLowerCase(), json.jawaban.toLowerCase().trim()) >= threshold) {
            m.reply(`*💢Dikit Lagi!*`);
        } else {
            m.reply(`*🚫Salah!*`);
        }
    }
    return !0;
};

handler.exp = 0;

export default handler;