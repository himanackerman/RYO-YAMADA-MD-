let handler = async (m, extra) => {
	try {
		if (!db.data.sticker) db.data.sticker = {}
		let sticker = db.data.sticker

		let mime = m.mimetype || m.msg?.mimetype || ''
		if (!/webp/.test(mime)) return false

		let rawHash = m.fileSha256 || m.msg?.fileSha256
		if (!rawHash) return false

		let hash = Buffer.isBuffer(rawHash) ? rawHash.toString('base64') : Buffer.from(rawHash).toString('base64')
		let data = sticker[hash]
		if (!data) return false

		let { conn } = extra
		let cmdText = (data.text || '').trim()
		if (!cmdText) return false

		let str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

		if (data.mentionedJid?.length) m.mentionedJid = data.mentionedJid

		let {
			isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, user
		} = extra
		let chat = global.db.data.chats[m.chat]

		for (let name in global.plugins) {
			let plugin = global.plugins[name]
			if (!plugin || plugin.disabled || typeof plugin !== 'function') continue

			// tentukan prefix khusus plugin ini (sama persis logic di handler.js)
			let pluginPrefix = plugin.customPrefix ? plugin.customPrefix : (conn.prefix ? conn.prefix : global.prefix)
			let pluginPrefixRegex = pluginPrefix instanceof RegExp
				? pluginPrefix
				: new RegExp(str2Regex(String(pluginPrefix)))

			let prefixMatch = pluginPrefixRegex.exec(cmdText)
			if (!prefixMatch) continue // pesan gak cocok prefix plugin ini, skip

			let pUsedPrefix = prefixMatch[0]
			let pNoPrefix = cmdText.replace(pUsedPrefix, '')
			let [pCommand, ...pArgs] = pNoPrefix.trim().split(' ').filter(v => v)
			pCommand = (pCommand || '').toLowerCase()
			let pText = pArgs.join(' ')

			let isAccept = plugin.command instanceof RegExp ? plugin.command.test(pCommand) :
				Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(pCommand) : cmd === pCommand) :
				typeof plugin.command === 'string' ? plugin.command === pCommand : false

			if (!isAccept) continue

			if (chat?.isBanned && !isOwner) return false
			if (user?.banned && !isOwner) return false

			if (plugin.rowner && !isROwner) return false
			if (plugin.owner && !isOwner) return false
			if (plugin.mods && !isROwner && !isOwner) return false
			if (plugin.premium && !isPrems) return false
			if (plugin.group && !m.isGroup) return false
			if (plugin.botAdmin && !isBotAdmin) return false
			if (plugin.admin && !isAdmin) return false
			if (plugin.private && m.isGroup) return false
			if (plugin.register && !user?.registered) return false

			if (!isPrems && plugin.limit && user?.limit < plugin.limit * 1) return false
			if (plugin.level && user?.level < plugin.level) return false

			await plugin.call(conn, m, {
				...extra,
				usedPrefix: pUsedPrefix,
				noPrefix: pNoPrefix,
				command: pCommand,
				args: pArgs,
				text: pText,
				match: [cmdText, pUsedPrefix]
			})
			break
		}
	} catch (e) {
		console.error(e)
	}
	return false
}

handler.before = handler
export default handler