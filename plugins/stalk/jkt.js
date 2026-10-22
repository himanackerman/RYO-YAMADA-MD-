const handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!text) {
		return m.reply(
			`Masukkan username member JKT48.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} Freya`
		);
	}

	try {
		await m.react("🍀");

		const api = global.APIs.kyzzz;
		const apikey = global.APIKeys[api];

		const res = await fetch(
			`${api}/api/stalker/jkt?username=${encodeURIComponent(text)}&apikey=${apikey}`
		);

		const json = await res.json();

		if (!json.status) {
			return m.reply(`❌ ${json.message || "Member tidak ditemukan."}`);
		}

		const d = json.result;

		const caption = `*\`JKT48 Stalker\`*

✿ *\`Nama\`* : ${d.name}
✿ *\`Nickname\`* : ${d.nickname}
✿ *\`Full Name\`* : ${d.fullname}
✿ *\`Team\`* : ${d.team}
✿ *\`Group\`* : ${d.group}
✿ *\`Generasi\`* : ${d.generation}
✿ *\`Tanggal Lahir\`* : ${new Date(d.birthdate).toLocaleDateString("id-ID")}
✿ *\`Golongan Darah\`* : ${d.bloodType}
✿ *\`Tinggi Badan\`* : ${d.height}
✿ *\`Graduate\`* : ${d.graduate ? "Ya ✅" : "Tidak ❌"}

✿ *\`Jikosokai\`* :
${d.jikosokai}

✿ *\`Instagram\`* : ${d.socials.find(v => v.title === "Instagram")?.url || "-"}
✿ *\`Twitter\`* : ${d.socials.find(v => v.title === "Twitter")?.url || "-"}
✿ *\`TikTok\`* : ${d.socials.find(v => v.title === "TikTok")?.url || "-"}
✿ *\`Showroom\`* : ${d.socials.find(v => v.title === "Showroom")?.url || "-"}
✿ *\`IDN\`* : ${d.socials.find(v => v.title === "IDN")?.url || "-"}`;

		let image;

		try {
			const img = await fetch(d.image, {
				headers: {
					"User-Agent": "Mozilla/5.0"
				}
			});

			if (!img.ok) throw new Error();

			image = Buffer.from(await img.arrayBuffer());
		} catch {
			const proxy = `https://wsrv.nl/?url=${encodeURIComponent(d.image)}&output=jpg`;

			const img = await fetch(proxy);

			if (!img.ok) throw new Error("Gagal mengambil gambar.");

			image = Buffer.from(await img.arrayBuffer());
		}

		await conn.sendMessage(
			m.chat,
			{
				image,
				caption
			},
			{ quoted: m }
		);
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`);
	}
};

handler.help = ["jktstalk"];
handler.tags = ["stalk"];
handler.command = ["jktstalk"];
handler.limit = true;

export default handler;