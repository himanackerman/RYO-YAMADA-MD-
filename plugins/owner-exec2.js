export const handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.reply(m.chat, "Contoh penggunaan: !eval 2 + 2", m);
    return;
  }

  let output = "";
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    output += args.join(" ") + "\n";
  };

  try {
    // Helper untuk kirim interaktif resmi WhatsApp
    const sendInteractive = async (chat, message) => {
      if (message.type === 'buttons') {
        await conn.sendMessage(chat, {
          text: message.content.text || ' ',
          footer: message.content.footer || '',
          buttons: message.content.buttons || [],
          headerType: 1
        }, { quoted: m });
      } else if (message.type === 'list') {
        await conn.sendMessage(chat, {
          text: message.content.text || ' ',
          footer: message.content.footer || '',
          buttonText: message.content.buttonText || 'Pilih',
          sections: message.content.sections || []
        }, { quoted: m });
      } else if (message.type === 'text') {
        await conn.sendMessage(chat, { text: message.content.text || ' ' }, { quoted: m });
      }
    };

    // Bungkus input user ke async function
    const result = await new Function(
      'conn', 'sock', 'm', 'sendInteractive',
      'return (async () => { ' + text + ' })()'
    )(conn, conn, m, sendInteractive);

    if (typeof result !== "undefined") {
      output += `Result: ${result}`;
    }
  } catch (e) {
    output += `Error: ${e.toString()}`;
  }

  console.log = originalConsoleLog;

  // Hapus ANSI color codes
  const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, '');

  // Kirim output
  if (cleanOutput.length > 4000) {
    const buffer = Buffer.from(cleanOutput, 'utf-8');
    await conn.sendMessage(m.chat, { document: buffer, fileName: 'output.txt', mimetype: 'text/plain' }, { quoted: m });
  } else {
    await conn.reply(m.chat, cleanOutput.trim(), m);
  }
};

handler.command = /^eval$/i;
handler.owner = true;

export default handler;