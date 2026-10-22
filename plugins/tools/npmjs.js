import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `Penggunaan: ${usedPrefix}${command} <nama_package>\n\nContoh: ${usedPrefix}${command} express`, m);
  }

  const query = text.trim();
  const msg = await conn.reply(m.chat, 'Sedang mencari package...', m);

  try {
    const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`);
    const result = await response.json();

    if (!result.objects || result.objects.length === 0) {
      return conn.edit(msg, `Tidak ada hasil untuk "${query}"`, m);
    }

    let caption = '— npmjs search —\n\n';
    
    result.objects.slice(0, 5).forEach((pkg, index) => {
      const package_data = pkg.package;
      caption += `${index + 1}. ❀ name :\n${package_data.name}\n\n`;
      caption += `❀ version :\n${package_data.version}\n\n`;
      caption += `❀ description :\n${package_data.description || 'Tidak ada deskripsi'}\n\n`;
      caption += `❀ author :\n${package_data.author?.name || 'Unknown'}\n\n`;
      caption += `❀ url :\n${package_data.links?.npm || 'N/A'}\n\n`;
      caption += '—————————————\n\n';
    });

    await conn.edit(msg, caption.trim(), m);
  } catch (error) {
    conn.reply(m.chat, 'Terjadi kesalahan: ' + error.message, m);
  }
};

handler.help = ['npmjs'];
handler.tags = ['search'];
handler.command = /^npmjs$/i;
handler.limit = true;
handler.register = true;

export default handler;