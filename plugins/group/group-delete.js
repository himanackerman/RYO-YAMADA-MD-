const handler = async (m, { conn, command }) => {
  if (!m.quoted) throw 'Reply pesan yang ingin dihapus';
  try {
    let bilek = m.message.extendedTextMessage.contextInfo.participant;
    let banh = m.message.extendedTextMessage.contextInfo.stanzaId;
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: banh, participant: bilek } });
  } catch {
    return conn.sendMessage(m.chat, { delete: m.quoted.vM.key });
  }
};

handler.help = ['del', 'delete','d'];
handler.tags = ['group'];
handler.command = /^(delete|del|hps|hapus|erase|d)$/i;
handler.admin = false;

export default handler;
