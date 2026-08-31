import { proto, generateWAMessage, areJidsSameUser } from 'baileys';

export async function all(m, chatUpdate) {
	if (m.isBaileys) return;
	if (!m.message) return;

	let id = '';

	try {
		const msg = m.message;

		if (msg.buttonsResponseMessage) {
			id = msg.buttonsResponseMessage.selectedButtonId;

		} else if (msg.listResponseMessage) {
			id = msg.listResponseMessage.singleSelectReply?.selectedRowId;

		} else if (msg.templateButtonReplyMessage) {
			id = msg.templateButtonReplyMessage.selectedId;

		} else if (msg.interactiveResponseMessage) {
			const data = msg.interactiveResponseMessage?.nativeFlowResponseMessage
				?? m.msg?.nativeFlowResponseMessage;

			if (data?.paramsJson) {
				try {
					const parsed = JSON.parse(data.paramsJson);
					id = parsed.id || parsed.rowId || '';
				} catch {
					id = data?.id || '';
				}
			} else {
				id = data?.id || '';
			}

		} else if (msg.pollUpdateMessage) {
			// poll update, skip atau handle sendiri kalau perlu
			return;

		} else {
			// bukan interactive message, skip
			return;
		}

	} catch (e) {
		console.log('Error parsing interactive:', e);
	}

	if (!id) return;

	let messages = await generateWAMessage(
		m.chat,
		{ text: id, mentions: m.mentionedJid },
		{
			userJid: this.user.jid,
			quoted: m.quoted && m.quoted.fakeObj,
		}
	);

	messages.key.remoteJid = m.chat;
	messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
	messages.key.id = m.key.id;
	messages.pushName = m.pushName;

	if (m.isGroup) {
		messages.key.participant = messages.participant = m.sender;
	}

	const upsertMsg = {
		...chatUpdate,
		messages: [proto.WebMessageInfo.create(messages)].map((v) => {
			v.conn = this;
			return v;
		}),
		type: 'append',
	};

	this.ev.emit('messages.upsert', upsertMsg);
}