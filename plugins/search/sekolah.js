let handler = async (m, { conn, text }) => {
	if (!text) {
		return m.reply("Masukkan nama sekolah yang ingin dicari.")
	}

	try {
		const api = "https://api.kyzzz.xyz"
		const apikey = global.APIKeys[global.APIs.kyzzz]

		const params = new URLSearchParams({
			q: text,
			limit: "10",
			page: "1",
			apikey
		})

		const res = await fetch(
			`${api}/api/search/sekolah?${params.toString()}`
		)

		if (!res.ok) {
			throw new Error(`API Error ${res.status}`)
		}

		const data = await res.json()

		if (!data?.status || !data.sekolah?.length) {
			return m.reply("Tidak ada sekolah ditemukan.")
		}

		const album = data.sekolah
			.map((v, i) => ({
				image: {
					url: v.foto
				},
				caption: `*\`Sekolah ${i + 1}\`*

✿ *\`Nama\`* : ${v.nama || "-"}
✿ *\`NPSN\`* : ${v.npsn || "-"}
✿ *\`Pendidikan\`* : ${v.bentuk_pendidikan || "-"}
✿ *\`Status\`* : ${v.status_sekolah || "-"}
✿ *\`Akreditasi\`* : ${v.akreditasi || "-"}
✿ *\`Alamat\`* : ${v.alamat || "-"}
✿ *\`Kecamatan\`* : ${v.kecamatan || "-"}
✿ *\`Kabupaten\`* : ${v.kabupaten || "-"}
✿ *\`Provinsi\`* : ${v.provinsi || "-"}
✿ *\`Kode Pos\`* : ${v.kode_pos || "-"}`
			}))
			.filter(v => v.image.url)
			.slice(0, 10)

		if (album.length) {
			await conn.sendMessage(
				m.chat,
				{ album },
				{ quoted: m }
			)
		} else {
			const result = data.sekolah
				.slice(0, 10)
				.map((v, i) => `*\`Sekolah ${i + 1}\`*

✿ *\`Nama\`* : ${v.nama || "-"}
✿ *\`NPSN\`* : ${v.npsn || "-"}
✿ *\`Pendidikan\`* : ${v.bentuk_pendidikan || "-"}
✿ *\`Status\`* : ${v.status_sekolah || "-"}
✿ *\`Alamat\`* : ${v.alamat || "-"}
✿ *\`Kecamatan\`* : ${v.kecamatan || "-"}
✿ *\`Kabupaten\`* : ${v.kabupaten || "-"}
✿ *\`Provinsi\`* : ${v.provinsi || "-"}`)
				.join("\n\n")

			await m.reply(result)
		}
	} catch (e) {
		console.error(e)
		m.reply(`Gagal mencari sekolah: ${e.message}`)
	}
}

handler.command = /^(sekolah|carisekolah)$/i
handler.help = ["sekolah <nama>"]
handler.tags = ["search"]
handler.register = true
handler.limit = true

export default handler