import axios from 'axios';

const bacaKomik = {
  api: {
    base: 'https://omikbkversialter.click',
    endpoints: {
      search: (keyword, paged = 1) => `page=search&search=${encodeURIComponent(keyword)}&paged=${paged}`,
      latest: () => 'page=latest',
      rekomendasi: () => 'page=rekomendasi',
      filter: params => {
        const query = new URLSearchParams();
        query.set('page', 'filter');
        if (params.type) query.set('type', params.type);
        if (params.status) query.set('status', params.status);
        (params.genre || []).forEach(g => query.append('genre[]', g));
        (params.content || []).forEach(c => query.append('content[]', c));
        (params.demographic || []).forEach(d => query.append('demographic[]', d));
        (params.theme || []).forEach(t => query.append('theme[]', t));
        return query.toString();
      },
      detail: id => `page=manga&id=${id}`,
      chapter: id => `page=chapter&id=${id}`
    }
  },

  headers: {
    'user-agent': 'Postify/1.0.0',
    Connection: 'Keep-Alive',
    'accept-encoding': 'gzip'
  },

  parse: url => {
    try {
      const full = new URL(url);
      const params = new URLSearchParams(full.search);
      const page = params.get('page');
      const id = params.get('id');
      return (page && id) ? { page, id } : null;
    } catch {
      return null;
    }
  },

  search: async (keyword = 'Love', paged = 1) => {
    if (typeof keyword !== 'string' || !keyword.trim()) {
      return {
        success: false,
        code: 400,
        result: { error: 'Keywordnya kudu diisi bree.. lu nyari apaan kosong begitu 🗿' }
      };
    }

    if (!Number.isInteger(paged) || paged < 1) {
      return {
        success: false,
        code: 400,
        result: { error: `Pages kudu angka yak, apaan2 lu input ${paged} 😂` }
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.search(keyword, paged)}`;

    try {
      const response = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (response.status === 404) {
        return {
          success: false,
          code: 404,
          result: { error: `Page ke-${paged} kagak ada bree... 🙈` }
        };
      }

      if (!Array.isArray(response.data) || response.data.length === 0) {
        return {
          success: false,
          code: 204,
          result: { error: `Page ke-${paged} kosong bree, kagak ada hasilnya :v` }
        };
      }

      const result = response.data.map(item => ({
        title: item.title || '',
        url: item.url || '',
        image: item.img || '',
        type: item.type || '',
        score: parseFloat(item.score) || 0,
        genres: Array.isArray(item.genre) ? item.genre : [],
        chapter: item.chapter || ''
      }));

      return {
        success: true,
        code: response.status,
        result: {
          query: keyword,
          paged,
          total: result.length,
          data: result
        }
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Pencariannya kagak bisa dilanjutin bree, error 😂' }
      };
    }
  },

  detail: async input => {
    const parsed = typeof input === 'string' ? bacaKomik.parse(input) : { page: 'manga', id: input };
    if (!parsed || parsed.page !== 'manga') {
      return { 
        success: false, 
        code: 400, 
        result: { error: 'Inputnya kudu URL yak bree, kek begini nih contohnya page=manga & id=82831 atau ID string langsung yak bree 😑' } 
      };
    }

    const url = `${bacaKomik.api.base}/?${bacaKomik.api.endpoints.detail(parsed.id)}`;

    try {
      const res = await axios.get(url, {
        headers: bacaKomik.headers,
        timeout: 10000,
        validateStatus: status => status >= 200 && status < 500
      });

      const data = res.data?.[0];
      if (!data) {
        return {
          success: false,
          code: 204,
          result: { error: 'Detail manga nya kagak ada bree... 🌚' }
        };
      }

      const result = {
        type: 'manga',
        id: parsed.id,
        title: data.title || '',
        synopsis: data.synopsis || '',
        score: parseFloat(data.score) || 0,
        status: data.status || '',
        cover: data.cover || '',
        thumbnail: data.img || '',
        author: Array.isArray(data.author) ? data.author.map(a => a.name || '') : [],
        genre: Array.isArray(data.genre) ? data.genre.map(g => g.name || '') : [],
        theme: Array.isArray(data.theme) ? data.theme.map(t => t.name || '') : [],
        content: Array.isArray(data.content) ? data.content.map(c => c.name || '') : [],
        demographic: Array.isArray(data.demographic) ? data.demographic.map(d => d.name || '') : [],
        chapters: Array.isArray(data.data) ? data.data.map(ch => ({
          chapter: ch.chapter || '',
          url: ch.url || '',
          download: ch.download || ''
        })) : []
      };

      return {
        success: true,
        code: res.status,
        result
      };
    } catch (err) {
      return {
        success: false,
        code: err.response?.status || 500,
        result: { error: 'Error bree 😂' }
      };
    }
  },
};


let handler = async (m, { conn, text, command }) => {
  switch (command) {
    case 'komiksearch': {
      if (!text) throw `Gunakan command dengan benar!\n*Contoh:*\n.komiksearch Overlord`;
      await m.reply('Mencari komik, mohon tunggu...');

      const searchResult = await bacaKomik.search(text);

      if (!searchResult.success) {
        return await m.reply(searchResult.result.error);
      }

      let replyMsg = `*Hasil Pencarian untuk "${searchResult.result.query}"*\n\n`;
      searchResult.result.data.forEach((komik, index) => {
        replyMsg += `*${index + 1}. ${komik.title}*\n`;
        replyMsg += `  - *Tipe:* ${komik.type}\n`;
        replyMsg += `  - *Skor:* ${komik.score}\n`;
        replyMsg += `  - *Chapter Terbaru:* ${komik.chapter}\n`;
        replyMsg += `  - *URL:* ${komik.url}\n\n`;
      });

      await m.reply(replyMsg);
      break;
    }

    case 'komikdetail': {
      if (!text) throw `Gunakan command dengan benar!\n*Contoh:*\n.komikdetail 82831\n*Atau:*\n.komikdetail https://omik....(url dari hasil search)`;
      await m.reply('Mengambil detail komik, mohon tunggu...');

      const detailResult = await bacaKomik.detail(text);

      if (!detailResult.success) {
        return await m.reply(detailResult.result.error);
      }

      const komik = detailResult.result;
      
      const chaptersToShow = komik.chapters.slice(0, 15);
      const chapterList = chaptersToShow.map(ch => `  - ${ch.chapter}`).join('\n');

      let detailMsg = `*乂 K O M I K - D E T A I L 乂*\n\n`;
      detailMsg += `*Judul:* ${komik.title}\n`;
      detailMsg += `*Status:* ${komik.status}\n`;
      detailMsg += `*Skor:* ${komik.score} ⭐\n`;
      detailMsg += `*Author:* ${komik.author.join(', ')}\n`;
      detailMsg += `*Genre:* ${komik.genre.join(', ')}\n`;
      if (komik.theme.length > 0) detailMsg += `*Tema:* ${komik.theme.join(', ')}\n`;
      if (komik.demographic.length > 0) detailMsg += `*Demografis:* ${komik.demographic.join(', ')}\n\n`;
      
      detailMsg += `*Sinopsis:*\n${komik.synopsis}\n\n`;
      
      detailMsg += `*Daftar Chapter (15 Teratas):*\n${chapterList}`;
      if (komik.chapters.length > 15) {
          detailMsg += `\n\n...dan masih banyak lagi.`;
      }

      await conn.sendFile(m.chat, komik.cover, 'cover.jpg', detailMsg, m);
      break;
    }
  }
};

handler.help = ['komiksearch <judul>', 'komikdetail <id/url>'];
handler.command = ['komiksearch', 'komikdetail'];
handler.tags = ['internet'];

export default handler;