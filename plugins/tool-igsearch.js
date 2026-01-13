/*
Jangan Hapus Wm Bang 

*Ig Search Reels Plugins Esm*

Entahlah Iya In aja Semua Meskipun Gak tw apa apa

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VaAMjXT4yltWm1NBJV3J
*/

import axios from 'axios';

async function igsearch(query, num = 8) {
  try {
    const params = {
      rsz: 'filtered_cse',
      num,
      hl: 'id',
      source: 'gcsc',
      cselibv: '5c8d58cbdc1332a7',
      cx: 'e500c3a7a523b49df',
      q: query,
      safe: 'off',
      cse_tok: 'AB-tC_5IarUshLDzUwPBHkPli705:1740389570639',
      lr: '',
      cr: '',
      gl: 'ID',
      filter: 0,
      sort: '',
      as_oq: '',
      as_sitesearch: '',
      exp: 'cc,apo',
      fexp: 72801194,
      oq: '',
      gs_l: 'partner-web.1.2.0i512l10.16186.55823.0.59720.6.6.0.0.0.0.263.1046.1j3j2.6.0.csems,nrl=10...0....1j4.34.partner-web..1.5.800.zwFquQkxWWg',
      callback: 'x.y',
      rurl: Buffer.from('aHR0cHM6Ly9yZWVsc2ZpbmRlci5zYXRpc2h5YWRhdi5jb20v','base64').toString(),
    };

    let ab = await axios.get('https://cse.google.com/cse/element/v1', {
      params: params,
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        'x-client-data': 'CJDjygE='
      }
    }).then(rs => rs.data);

    const jsonString = ab.slice(ab.indexOf('{'), ab.lastIndexOf('}') + 1);
    const jsonData = JSON.parse(jsonString);

    let data = jsonData.results.map(item => {
      let i1 = new URL(item.unescapedUrl), url = i1.origin + i1.pathname;
      let fr = (a) => a.replace(/\n/gi,' ').replace(/<(b|\/b)[^>]*>/gi, '*');
      return {
        title: fr(item.title),
        desc: fr(item.contentNoFormatting),
        url: url,
      }
    });
    return { status: true, data };
  } catch(e) {
    return { status: false, msg: `Failed to load data, log: ${e.message}`};
  }
}

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(`Example: ${usedPrefix + command} reels viral`);
  
  const result = await igsearch(text);
  
  if (!result.status) return m.reply(result.msg);
  
  if (result.data.length === 0) return m.reply(`No results found for "${text}"`);
  
  let teks = `Pencarian ${text}\n\n`;
  
  result.data.forEach((item, index) => {
    teks += `===== [ ${index + 1} ] =====\n`;
    teks += `> Judul: ${item.title}\n`;
    teks += `> Desk: ${item.desc}\n`;
    teks += `> Url: ${item.url}\n\n`;
  });
  
  m.reply(teks);
};

handler.help = ['igsearch <query>'];
handler.tags = ['search', 'internet'];
handler.command = /^(igsearch|igfind|instagramsearch)$/i;

export default handler;