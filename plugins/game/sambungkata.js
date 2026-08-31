import fs from 'fs'

const kbbi = JSON.parse(
	fs.readFileSync('./json/kbbi.json')
)

const game = `╔══「 *Kata Bersambung* 」
╟ Game Kata Bersambung adalah
║ permainan yang dimana setiap
║ pemainnya diharuskan membuat
║ kata dari akhir kata yang
║ berasal dari kata sebelumnya.
╚═════`.trim()

const rules = `╔══「 *PERATURAN* 」
╟ Jawaban merupakan kata dasar
║ tidak mengandung spasi/imabuhan
╟ Ketik *nyerah* untuk keluar
╚═════`.trim()

let handler = async (m, { conn, text, usedPrefix, command, isROwner }) => {

	conn.skata = conn.skata || {}

	let id = m.chat
	let room = conn.skata[id]

	let isDebug = /debug/i.test(command) && isROwner

	if (!room) {

		conn.skata[id] = {
			id,
			player: isDebug
				? [
					owner[2] + '@s.whatsapp.net',
					conn.user.jid,
					owner[0] + '@s.whatsapp.net'
				]
				: [m.sender],
			status: 'wait',
			curr: '',
			kata: '',
			waktu: null
		}

		room = conn.skata[id]

		return conn.reply(
			m.chat,
			`${game}

${rules}

╔═〘 Daftar Player 〙
${room.player.map((v, i) => `╟ ${i + 1}. @${v.split('@')[0]}`).join('\n')}
╚════

Ketik:
*${usedPrefix + command}* → join
*${usedPrefix + command} start* → mulai`,
			m,
			{
				mentions: room.player
			}
		)
	}

	if (room.status === 'wait') {

		if (text === 'start') {

			if (!room.player.includes(m.sender)) {
				throw 'Kamu belum join'
			}

			if (room.player.length < 2) {
				throw 'Minimal 2 player'
			}

			room.status = 'play'
			room.curr = room.player[0]
			room.kata = await genKata()

			return mulaiGame(conn, m, room)
		}

		if (room.player.includes(m.sender)) {
			throw 'Kamu sudah join'
		}

		room.player.push(m.sender)

		return conn.reply(
			m.chat,
			`╔═〘 Daftar Player 〙
${room.player.map((v, i) => `╟ ${i + 1}. @${v.split('@')[0]}`).join('\n')}
╚════

Ketik:
*${usedPrefix + command}* → join
*${usedPrefix + command} start* → mulai`,
			m,
			{
				mentions: room.player
			}
		)
	}
}

handler.before = async function (m) {
  if (m.fromMe || m.isBaileys) return

	let conn = this

	conn.skata = conn.skata || {}

	let room = conn.skata[m.chat]

	if (!room) return
	if (room.status !== 'play') return
	if (m.isBaileys) return
	if (!m.text) return
	if (m.sender !== room.curr) return

	let jawab = m.text.toLowerCase().trim()

	if (jawab === 'nyerah') {

		clearTimeout(room.waktu)

		room.player = room.player.filter(v => v !== m.sender)

		await conn.reply(
			m.chat,
			`@${m.sender.split('@')[0]} menyerah`,
			m,
			{
				mentions: [m.sender]
			}
		)

		if (room.player.length <= 1) {

			await conn.reply(
				m.chat,
				`🏆 @${room.player[0].split('@')[0]} menang!`,
				m,
				{
					mentions: room.player
				}
			)

			delete conn.skata[m.chat]
			return true
		}

		room.curr = room.player[0]
		room.kata = await genKata()

		return mulaiGame(conn, m, room)
	}

	let awalan = filter(room.kata).toLowerCase()

	if (!jawab.startsWith(awalan)) return

	if (!kbbi.includes(jawab)) {
		return conn.reply(
			m.chat,
			`Kata tidak ada di kamus`,
			m
		)
	}

	clearTimeout(room.waktu)

	let index = room.player.indexOf(m.sender)

	if (index >= room.player.length - 1) {
		room.curr = room.player[0]
	} else {
		room.curr = room.player[index + 1]
	}

	room.kata = jawab

	return mulaiGame(conn, m, room)
}

handler.help = ['sambungkata']
handler.tags = ['game']
handler.command = /^s(ambung)?kata$/i
handler.group = true
handler.game = true

export default handler

async function mulaiGame(conn, m, room) {

	clearTimeout(room.waktu)

	await conn.reply(
		m.chat,
		`Giliran @${room.curr.split('@')[0]}

Kata:
*${room.kata.toUpperCase()}*

Lanjut:
*${filter(room.kata).toUpperCase()}...*

Ketik *nyerah* untuk menyerah`,
		m,
		{
			mentions: [room.curr]
		}
	)

	room.waktu = setTimeout(async () => {

		await conn.reply(
			m.chat,
			`@${room.curr.split('@')[0]} kehabisan waktu`,
			m,
			{
				mentions: [room.curr]
			}
		)

		room.player = room.player.filter(v => v !== room.curr)

		if (room.player.length <= 1) {

			await conn.reply(
				m.chat,
				`🏆 @${room.player[0].split('@')[0]} menang!`,
				m,
				{
					mentions: room.player
				}
			)

			delete conn.skata[room.id]
			return
		}

		room.curr = room.player[0]
		room.kata = await genKata()

		mulaiGame(conn, m, room)

	}, 45000)
}

async function genKata() {

	function random(list) {
		return list[Math.floor(Math.random() * list.length)]
	}

	let huruf = random([
		'a', 'b', 'c', 'd', 'e',
		'g', 'h', 'i', 'j', 'k',
		'l', 'm', 'n', 'p', 'r',
		's', 't', 'u', 'w'
	])

	let res = kbbi.filter(v => v.startsWith(huruf))

	let result = random(res)

	while (!result || result.length < 3 || result.length > 7) {
		result = random(res)
	}

	return result.toLowerCase()
}

function filter(text) {

	let mati = [
		'q', 'w', 'r', 't', 'y', 'p',
		's', 'd', 'f', 'g', 'h', 'j',
		'k', 'l', 'z', 'x', 'c', 'v',
		'b', 'n', 'm'
	]

	let misah

	if (text.length < 3) return text

	if (/([qwrtypsdfghjklzxcvbnm][qwrtypsdfhjklzxcvbnm])$/.test(text)) {
		let mid = /([qwrtypsdfhjklzxcvbnm])$/.exec(text)[0]
		return mid
	}

	else if (/([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.test(text)) {
		let mid = /([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.exec(text)[0]
		return mid
	}

	else if (/([aiueo][aiueo]([qwrtypsdfghjklzxcvbnm]|ng)?)$/i.test(text)) {

		if (/(ng)$/i.test(text)) return text.substring(text.length - 3)

		else if (/([qwrtypsdfghjklzxcvbnm])$/i.test(text)) {
			return text.substring(text.length - 2)
		}

		else {
			return text.substring(text.length - 1)
		}
	}

	else if (/n[gy]([aiueo]([qwrtypsdfghjklzxcvbnm])?)$/.test(text)) {

		let nyenye = /n[gy]/i.exec(text)[0]

		misah = text.split(nyenye)

		return nyenye + misah[misah.length - 1]
	}

	else {

		let res = Array.from(text).filter(v => mati.includes(v))

		let result = res[res.length - 1]

		for (let huruf of mati) {
			if (text.endsWith(huruf)) {
				result = res[res.length - 2]
			}
		}

		misah = text.split(result)

		if (text.endsWith(result)) {
			return result + misah[misah.length - 2] + result
		}

		return result + misah[misah.length - 1]
	}
}