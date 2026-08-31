let handler = async (m, { text, usedPrefix, command }) => {
	if (!text) {
		return m.reply(
			`Masukkan URL Safelink.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} https://sfl.gl/ntCx0RF`
		)
	}

	try {
		await m.react("🍀")

		const api = global.APIs.kyzzz
		const apikey = global.APIKeys[api]

		const res = await fetch(
			`${api}/api/bypass/sfl?url=${encodeURIComponent(text)}&apikey=${apikey}`
		)

		const json = await res.json()

		if (!json.status) {
			return m.reply("❌ Gagal membypass URL.")
		}

		const d = json.result

		await m.reply(`*\`Safelink Bypass\`*

✿ *\`Original URL\`* : ${d.originalUrl}

✿ *\`Destination URL\`* :
${d.destinationUrl}`)
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`)
	}
}

handler.help = ["sfl <url>"]
handler.tags = ["tools"]
handler.command = /^(sfl|bypasssfl)$/i
handler.limit = true

export default handler