import fetch from 'node-fetch'

let handler = {}

handler.before = async function (m) {
	try {
		if (!m?.text) return true

		if (m.fromMe || m.key?.fromMe || m.isBaileys) return true

		const conn = this

		const botJid =
			conn?.user?.jid ||
			conn?.user?.id ||
			''

		if (m.sender === botJid) return true

		const chat = global.db.data.chats?.[m.chat]

		if (!chat?.autosimi) return true
		if (chat.autogpt) return true

		if (/^[./#!$]/.test(m.text)) return true

		const text = m.text.trim()

		if (!text) return true

		const res = await fetch(
			`https://api.nexray.web.id/ai/simisimi?text=${encodeURIComponent(text)}`
		)

		if (!res.ok) return true

		const json = await res.json()

		const reply =
			json?.result ||
			json?.data?.result ||
			json?.data ||
			json?.message

		if (!reply || typeof reply !== 'string') return true

		await conn.sendMessage(
			m.chat,
			{
				text: reply
			},
			{
				quoted: m
			}
		)
	} catch (e) {
		console.log('AutoSimi Error:', e)
	}

	return true
}

export default handler