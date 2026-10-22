import { canLevelUp } from '../../lib/levelling.js'
import { canvasLevelUp } from '../../lib/canvaslevelup.js'

let handler = m => m

handler.before = async function (m) {
	if (m.fromMe || m.isBaileys) return true

	const botNumber = this.user?.id?.split(':')[0] + '@s.whatsapp.net'
	if (m.sender === botNumber) return true

	const user = global.db.data.users[m.sender]
	const chat = global.db.data.chats[m.chat]

	if (!user || !chat) return true

	const before = user.level

	if (chat.autolevelup) {
		while (canLevelUp(user.level, user.exp, global.multiplier)) {
			user.level++
		}
	}

	const role =
		user.level <= 2 ? 'Newbie ㋡' :
		user.level <= 4 ? 'Beginner 1 ⚊¹' :
		user.level <= 6 ? 'Beginner 2 ⚊²' :
		user.level <= 8 ? 'Beginner 3 ⚊³' :
		user.level <= 10 ? 'Beginner 4 ⚊⁴' :
		user.level <= 20 ? 'Adventurer 1 ⚌¹' :
		user.level <= 30 ? 'Adventurer 2 ⚌²' :
		user.level <= 40 ? 'Adventurer 3 ⚌³' :
		user.level <= 50 ? 'Adventurer 4 ⚌⁴' :
		user.level <= 60 ? 'Adventurer 5 ⚌⁵' :
		user.level <= 70 ? 'Fighter 1 ☰¹' :
		user.level <= 80 ? 'Fighter 2 ☰²' :
		user.level <= 90 ? 'Fighter 3 ☰³' :
		user.level <= 100 ? 'Fighter 4 ☰⁴' :
		user.level <= 110 ? 'Fighter 5 ☰⁵' :
		user.level <= 120 ? 'Brigand 1 ≣¹' :
		user.level <= 130 ? 'Brigand 2 ≣²' :
		user.level <= 140 ? 'Brigand 3 ≣³' :
		user.level <= 150 ? 'Brigand 4 ≣⁴' :
		user.level <= 160 ? 'Brigand 5 ≣⁵' :
		user.level <= 170 ? 'Swordsman 1 ﹀¹' :
		user.level <= 180 ? 'Swordsman 2 ﹀²' :
		user.level <= 190 ? 'Swordsman 3 ﹀³' :
		user.level <= 200 ? 'Swordsman 4 ﹀⁴' :
		user.level <= 210 ? 'Swordsman 5 ﹀⁵' :
		'𖤐 G O D 𖤐'

	user.role = role

	if (!chat.autolevelup || before === user.level) return true

	try {
		let pp

		try {
			pp = await this.profilePictureUrl(m.sender, 'image')
		} catch {
			pp = null
		}

		const buffer = await canvasLevelUp(
			pp,
			await this.getName(m.sender),
			before,
			user.level,
			user.role
		)

		await this.sendMessage(
			m.chat,
			{
				image: buffer,
				caption: `*\`Level Up\`*

✿ *\`Nama\`* : ${await this.getName(m.sender)}
✿ *\`Level Sebelumnya\`* : ${before}
✿ *\`Level Sekarang\`* : ${user.level}
✿ *\`Naik Level\`* : +${user.level - before}
✿ *\`Role Baru\`* : ${user.role}`
			},
			{ quoted: m }
		)
	} catch (e) {
		console.error('LevelUp Error:', e)
	}

	return true
}

export default handler