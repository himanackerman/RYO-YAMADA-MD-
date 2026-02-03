/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, { conn, command }) => {
	try {
		await conn.chatModify({ pin: command.includes('un') ? false : true }, m.chat)
		m.reply(`Chat berhasil di *${command.includes('un') ? 'unpin' : 'pin'}*.`)
	} catch (e) {
		console.log(e)
		m.reply('Gagal, coba lagi nanti.')
	}
}

handler.help = ['pinchat','unpinchat']
handler.tags = ['owner']
handler.command = /^((un)?pin(chats?))$/i

handler.rowner = true

export default handler