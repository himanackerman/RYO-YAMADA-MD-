/*
Jangan Hapus Wm Bang 

*Check Host Website  Plugins Esm*

Entahlah Iya In aja Meski Gak Tawu afa ada

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/116
*/

import axios from 'axios';
import * as cheerio from 'cheerio';

const checkHost = {
  api: {
    base: 'https://check-host.net',
    timeout: 30000,
    retries: 5
  },
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Postify/1.0.0'
  },
  types: ['ping', 'http', 'tcp', 'udp', 'dns', 'info'],

  hostname: (host) => {
    const regex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$|^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(host);
  },

  domain: (input) => {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return new URL(input).hostname;
    }
    return input;
  },

  flagEmoji: (cc) => {
    const codePoints = cc
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  },

  request: async (endpoint, params = {}) => {
    try {
      const { data } = await axios.get(`${checkHost.api.base}/${endpoint}`, {
        params,
        headers: checkHost.headers,
        timeout: checkHost.api.timeout
      });
      return data;
    } catch (error) {
      console.error(`${error.message}`, error.response?.data);
      throw error;
    }
  },

  info: async (host) => {
    try {
      const response = await axios.get(`${checkHost.api.base}/ip-info`, {
        params: { host },
        headers: checkHost.headers,
        timeout: checkHost.api.timeout
      });

      const $ = cheerio.load(response.data);
      const infox = {};

      $('.ipinfo-item').each((index, element) => {
        const provider = $(element).find('strong a').text().trim().split('\n')[0].trim().toLowerCase().replace(/\s+/g, '_');
        const data = {};

        $(element).find('table tr').each((i, row) => {
          let key = $(row).find('td:first-child').text().trim().toLowerCase().replace(/\s+/g, '_');
          let value = $(row).find('td:last-child').text().trim();
          
          value = value.replace(/\s+/g, ' ').trim();
          if (key === "ip_range") {
            value = value.split('CIDR')[0].trim();
          }
          if (key === "country") {
            const src = $(row).find('td:last-child img.flag').attr('src');
            if (src) {
              const cc = src.split('/').pop().split('.')[0];
              data['country_code'] = cc.toLowerCase();
              data['country_flag'] = `https://check-host.net${src}`;
              data['country_flag_emoji'] = checkHost.flagEmoji(cc);
            }
          }
          if (value !== '') {
            data[key] = key === 'country_flag' || key === 'country_flag_emoji' ? value : value.toLowerCase();
          }
        });

        infox[provider] = data;
      });

      return { status: true, data: infox };
    } catch (error) {
      return { status: false, message: `${error.message}` };
    }
  },

  results: async (requestId, nodes, tries = 0) => {
    if (!requestId || Object.keys(nodes).length === 0 || tries >= 20) {
      return { status: false, message: "Waduh, nodenya kosong atau enggak terlalu kebanyakan nyoba bree 🤣" };
    }

    try {
      const nodesParams = Object.keys(nodes).map(node => `nodes[]=${encodeURIComponent(node)}`).join('&');
      const data = await checkHost.request(`check-result/${requestId}`, new URLSearchParams(nodesParams));

      for (const node in data) {
        if (data[node] && nodes[node] && nodes[node].length >= 2) {
          const cc = nodes[node][0].toLowerCase();
          const countryName = nodes[node][1].toLowerCase();
          data[node] = {
            ...data[node],
            country_code: cc,
            country_name: countryName,
            flag_url: `https://check-host.net/images/flags/${cc}.png`,
            flag_emoji: checkHost.flagEmoji(cc)
          };
        }
      }

      const remainingNodes = Object.keys(nodes).filter(node => !(node in data));

      if (remainingNodes.length > 0 && tries < 19) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const nodesx = Object.fromEntries(remainingNodes.map(node => [node, nodes[node]]));
        const nextResults = await checkHost.results(requestId, nodesx, tries + 1);
        return { status: true, data: { ...data, ...nextResults.data } };
      }

      return { status: true, data };
    } catch (error) {
      return { status: false, message: `${error.message}` };
    }
  },

  check: async (host, type = 'ping', paramek = {}) => {
    if (!host || host.trim() === '') {
      return { status: false, message: 'Lah, hostnya mana bree? 🗿' };
    }

    if (!checkHost.types.includes(type)) {
      return { status: false, message: `Yaelah, tipe checknya nggak ada bree. Coba pilih salah satu dari ini dahh: ${checkHost.types.join(', ')}` };
    }

    const hostx = checkHost.domain(host);
    if (!checkHost.hostname(hostx)) {
      return { status: false, message: 'Kalo masukin input tuh yang bener bree 🗿' };
    }

    const tipes = type === 'info' ? 'ip-info' : `check-${type}`;

    if (type === 'tcp' || type === 'udp') {
      if (!paramek.port) {
        return { status: false, message: `Ebuseet, portnya lupa diisi tuh buat check ${type}.` };
      }
    } else if (type === 'dns') {
      if (!paramek.type) {
        return { status: false, message: 'Record type buat DNS checknya mana nih bree? Jangan bikin emosi mulu napa 🗿'};
      }
    }

    try {
      if (type === 'info') {
        return await checkHost.info(hostx);
      }

      const response = await checkHost.request(tipes, { host: hostx, ...paramek });
      
      if (!response || typeof response !== 'object') {
        return { status: false, message: "Yaelah, servernya ngasih response ngaco bree 😂" };
      }

      const { request_id, nodes } = response;
      if (!request_id || !nodes) {
        return { status: false, message: "Initial checknya failed bree 😂\nCoba lagi nanti ae yak ..." };
      }

      await new Promise(resolve => setTimeout(resolve, 5000));

      const result = await checkHost.results(request_id, nodes);

      if (result.status) {
        return {
          status: true,
          data: {
            host: hostx,
            type: type,
            result: result.data
          }
        };
      } else {
        return result;
      }
    } catch (error) {
      return { status: false, message: `${error.message}` };
    }
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`Mana host/domain nya??

Cara pakai:
${usedPrefix}${command} host type
${usedPrefix}${command} host type port/record

Tipe yang tersedia:
• ping
• http
• tcp (+ port)
• udp (+ port)
• dns (+ record type)
• info

Contoh:
${usedPrefix}${command} google.com ping
${usedPrefix}${command} google.com tcp 80
${usedPrefix}${command} google.com dns A`)
    }

    let [host, type = 'ping', param] = args
    
    try {
        m.reply('Sabar ya, lagi ngecek...')
        
        let params = {}
        if (type === 'tcp' || type === 'udp') {
            params.port = param || '80'
        } else if (type === 'dns') {
            params.type = param || 'A'
        }
        
        const result = await checkHost.check(host, type, params)
        
        if (!result.status) {
            return m.reply(result.message)
        }

        let txt = `📡 *CHECK HOST*\n`
        txt += `📍 Host: ${result.data.host}\n`
        txt += `🔎 Type: ${result.data.type}\n\n`

        if (type === 'info') {
            for (let provider in result.data.data) {
                txt += `*${provider.toUpperCase()}*\n`
                for (let key in result.data.data[provider]) {
                    if (key !== 'country_flag' && key !== 'country_flag_emoji') {
                        txt += `› ${key.replace(/_/g, ' ')}: ${result.data.data[provider][key]}\n`
                    }
                }
                txt += '\n'
            }
        } else {
            for (let node in result.data.result) {
                let nodeData = result.data.result[node]
                txt += `*${nodeData.country_name} ${nodeData.flag_emoji}*\n`
                
                if (Array.isArray(nodeData[0])) {
                    nodeData[0].forEach(res => {
                        txt += `› ${res}\n`
                    })
                } else if (typeof nodeData[0] === 'object') {
                    txt += `› status: ${nodeData[0].status}\n`
                    if (nodeData[0].status === 'down') {
                        txt += `› error: ${nodeData[0].error}\n`
                    } else if (type === 'http') {
                        txt += `› code: ${nodeData[0].code}\n`
                        txt += `› response time: ${nodeData[0].time}s\n`
                    }
                }
                txt += '\n'
            }
        }

        m.reply(txt.trim())
        
    } catch (error) {
        console.error(error)
        m.reply('Waduh error nih! Coba lagi nanti ya')
    }
}

handler.help = ['checkhost', 'cekhost']
handler.tags = ['tools']
handler.command = ['checkhost', 'cekhost', 'check']
handler.limit = false

export default handler