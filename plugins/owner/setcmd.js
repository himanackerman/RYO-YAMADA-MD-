let handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!db.data.sticker) db.data.sticker = {}
	let sticker = db.data.sticker

	let getHash = () => {
		if (!m.quoted) throw `Balas stiker dengan perintah *${usedPrefix + command}*`
		let mime = m.quoted.mimetype || ''
		if (!/webp/.test(mime)) throw 'Balas *stiker* ya!'
		if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing'
		return m.quoted.fileSha256.toString('base64')
	}

	switch (command) {

		case 'setcmd': {
			if (!text) throw `Penggunaan:\n${usedPrefix}setcmd <teks>`
			let hash = getHash()

			if (sticker[hash]?.locked) throw 'Sticker ini dikunci!'

			sticker[hash] = {
				text,
				mentionedJid: m.mentionedJid || [],
				creator: m.sender,
				at: Date.now(),
				locked: false
			}

			m.reply(`✅ Berhasil set command!\n📝 ${text}`)
		}
		break

		case 'delcmd': {
			let hash = getHash()

			if (!sticker[hash]) throw 'Sticker belum ada command'
			if (sticker[hash].locked) throw 'Sticker ini dikunci!'

			delete sticker[hash]

			m.reply('🗑️ Command sticker berhasil dihapus!')
		}
		break

		case 'listcmd': {
			let teks = Object.entries(sticker).map(([hash, data], i) => {
				return `${i + 1}. ${data.text}\n   Locked: ${data.locked ? 'Yes' : 'No'}`
			}).join('\n\n')

			if (!teks) teks = 'Belum ada sticker command'

			m.reply(`📋 *List Sticker CMD:*\n\n${teks}`)
		}
		break

		case 'lockcmd': {
			let hash = getHash()

			if (!sticker[hash]) throw 'Sticker belum ada command'

			sticker[hash].locked = true
			m.reply('🔒 Sticker berhasil dikunci!')
		}
		break

		case 'unlockcmd': {
			let hash = getHash()

			if (!sticker[hash]) throw 'Sticker belum ada command'

			sticker[hash].locked = false
			m.reply('🔓 Sticker berhasil dibuka!')
		}
		break
	}
}

handler.help = [
	'setcmd <teks>',
	'delcmd',
	'listcmd',
	'lockcmd',
	'unlockcmd'
]
handler.tags = ['owner']
handler.command = /^(setcmd|delcmd|listcmd|lockcmd|unlockcmd)$/i
handler.owner = true 
export default handler