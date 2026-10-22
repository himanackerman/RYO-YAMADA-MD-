const handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!text) {
		return m.reply(
			`Masukkan teks.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} Halo semuanya\n` +
			`${usedPrefix + command} perempuan|Halo semuanya\n` +
			`${usedPrefix + command} laki|Halo semuanya\n\n` +
			`❀ Voice tersedia:\n` +
			`❀ laki (default)\n` +
			`❀ perempuan`
		);
	}

	let voice = "laki";
	let pesan = text;

	if (text.includes("|")) {
		const [v, ...msg] = text.split("|");
		if (["laki", "perempuan"].includes(v.trim().toLowerCase())) {
			voice = v.trim().toLowerCase();
			pesan = msg.join("|").trim();
		}
	}

	if (!pesan) {
		return m.reply("❌ Masukkan teks yang ingin diubah menjadi suara.");
	}

	try {
		await m.react("🍀");

		const api = global.APIs.kyzzz;
		const apikey = global.APIKeys[api];

		const res = await fetch(
			`${api}/api/audio/tts-id?text=${encodeURIComponent(pesan)}&voice=${voice}&apikey=${apikey}`
		);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const buffer = Buffer.from(await res.arrayBuffer());

		if (!buffer.length) throw new Error("Audio kosong.");

		await conn.sendMessage(
			m.chat,
			{
				audio: buffer,
				mimetype: "audio/mpeg",
				fileName: "tts.mp3"
			},
			{ quoted: m }
		);
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`);
	}
};

handler.help = ["ttsdracin <teks>"];
handler.tags = ["voice"];
handler.command = ["ttsdracin"];
handler.limit = true;

export default handler;