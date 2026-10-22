const endpoint = {
	to3d: "to3d",
	toanime: "toanime",
	tocyberpunk: "tocyberpunk",
	todisney: "todisney",
	toghibli: "toghibli",
	tojepang: "tojepang",
	tolego: "tolego",
	tomanga: "tomanga",
	tooil: "tooil",
	topixar: "topixar",
	tosketch: "tosketch"
};

const handler = async (m, { conn, command }) => {
	const q = m.quoted ? m.quoted : m;
	const mime = (q.msg || q).mimetype || "";

	if (!/image/.test(mime)) {
		return m.reply("Reply gambar.");
	}

	try {
		await m.react("🍀");

		const api = global.APIs.kyzzz;
		const apikey = global.APIKeys[api];

		const media = await q.download();

		const form = new FormData();
		form.append("image", new Blob([media]), "image.jpg");

		const res = await fetch(
			`${api}/api/ai-image/${endpoint[command]}?apikey=${apikey}`,
			{
				method: "POST",
				body: form
			}
		);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const type = res.headers.get("content-type") || "";
		let buffer;

		if (type.includes("application/json")) {
			const json = await res.json();

			if (!json.status) {
				throw new Error(json.message || "Gagal memproses gambar.");
			}

			const url =
				json.result ||
				json.url ||
				json.data?.url;

			if (!url) throw new Error("Gambar tidak ditemukan.");

			const img = await fetch(url);

			if (!img.ok) throw new Error(`HTTP ${img.status}`);

			buffer = Buffer.from(await img.arrayBuffer());
		} else {
			buffer = Buffer.from(await res.arrayBuffer());
		}

		await conn.sendMessage(
			m.chat,
			{ image: buffer },
			{ quoted: m }
		);
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`);
	}
};

handler.help = [
	"to3d", "toanime", "tocyberpunk", "todisney",
	"toghibli", "tojepang", "tolego",
	"tomanga", "tooil", "topixar", "tosketch"
];

handler.tags = ["image"];

handler.command =
	/^(to3d|toanime|tocyberpunk|todisney|toghibli|tojepang|tolego|tomanga|tooil|topixar|tosketch)$/i;

handler.limit = true;

export default handler;