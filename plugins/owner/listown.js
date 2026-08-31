/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, {
	conn,
	text,
	usedPrefix
}) => {
	let response = "• *OWNER SUBSCRIPTION*\n\n";
	let totalOwner = 0;

	for (let user in global.db.data.users) {
		if (global.db.data.users[user].owner) {
			let number = user.split("@")[0];
			let name = global.db.data.users[user].name || "";
			let days = Math.abs(Math.floor((global.db.data.users[user].ownerTime - new Date()) / (24 * 60 * 60 * 1000)));
			let hours = Math.abs(Math.floor((global.db.data.users[user].ownerTime - new Date()) / (60 * 60 * 1000))) % 24;
			let minutes = Math.abs(Math.floor((global.db.data.users[user].ownerTime - new Date()) / (60 * 1000))) % 60;

			response += `∝───────•••───────\n◦  *${number}*\n•  ${name}\n*Active period*: ${days} Hari ${hours} Jam ${minutes} Menit\n∝───────•••───────\n`;

			totalOwner++;
		}
	}

	response += `┌  ◦  Total Owner : *${totalOwner}*\n`;
	response += "└  ◦  Upgrade Owner: *.owner*";

	m.reply(response, m.from, {
		contextInfo: {
			mentionedJid: Object.keys(global.db.data.users).filter(jid => global.db.data.users[jid].owner)
		}
	});
}

handler.help =  ['listowner']
handler.command = /^(listown(er|ers)?)$/i
handler.tags = ['owner']

handler.owner = true
export default handler