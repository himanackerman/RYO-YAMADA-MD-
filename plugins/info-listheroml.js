/*
Jangan Hapus Wm Bang 

*Search ML Heroes Plugins Esm*

Cari Hero ML Dan Detail Sama List Hero ML

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*
https://whatsapp.com/channel/0029Vaf07jKCBtxAsekFFk3i/3031
*/

import axios from 'axios';
import cheerio from 'cheerio';
import { translate } from 'bing-translate-api';

async function listHeroEmel() {
    try {
        const response = await axios.get('https://liquipedia.net/mobilelegends/Portal:Heroes');
        const $ = cheerio.load(response.data);
        const heroes = [];

        $('.tabs-content .gallerybox').each((i, element) => {
            const heroName = $(element).find('a').attr('title');
            const heroLink = $(element).find('a').attr('href');
            const heroImage = $(element).find('img').attr('src');

            if (heroName) {
                heroes.push({
                    name: heroName,
                    link: `https://liquipedia.net${heroLink}`,
                    image: `https://liquipedia.net${heroImage}`
                });
            }
        });

        return heroes;
    } catch (error) {
        return error.message;
    }
}

async function detailHeroEmel(heroName) {
    try {
        const list = await listHeroEmel();
        const hero = list.find(h => h.name.toLowerCase() === heroName.toLowerCase());

        if (!hero) return `Hero *${heroName}* tidak ditemukan!`;

        const response = await axios.get(hero.link);
        const $ = cheerio.load(response.data);
        
        const heroData = {
            name: $('h1.firstHeading').text().trim(),
            image: 'https://liquipedia.net' + $('.infobox-image img').attr('src'),
            abilities: [],
            lore: $('#mw-content-text p').first().text().trim(),
            baseStats: {}
        };

        $('.infobox-cell-2.infobox-description').each((i, element) => {
            const statName = $(element).text().trim();
            const statValue = $(element).next().text().trim();
            heroData.baseStats[statName] = statValue;
        });

        $('.spellcard-wrapper').each((i, element) => {
            const abilityDescription = $(element).find('.spellcard-description').text().trim();
            if (abilityDescription) {
                heroData.abilities.push(abilityDescription);
            }
        })
        
        heroData.lore = await translateToIndonesian(heroData.lore);
        heroData.abilities = await Promise.all(heroData.abilities.map(async (desc) => await translateToIndonesian(desc)));

        return heroData;
    } catch (error) {
        return error.message;
    }
}

async function translateToIndonesian(text) {
    if (!text) return "Tidak tersedia.";

    try {
        const result = await translate(text, 'en', 'id');
        return result.translation;
    } catch (error) {
        console.error("Terjemahan gagal:", error);
        return text; // Jika gagal, kembalikan teks asli.
    }
}

const handler = async (m, { conn, command, args }) => {
    if (command === 'listhero') {
        const heroes = await listHeroEmel();
        if (typeof heroes === 'string') return m.reply(heroes);

        let text = '*📜 Daftar Hero Mobile Legends:*\n\n';
        heroes.slice(0, 20).forEach((hero, i) => {
            text += `${i + 1}. *${hero.name}*\n🔗 ${hero.link}\n\n`;
        });

        return m.reply(text.trim());
    } 
    
    if (command === 'hero') {
        if (!args[0]) return m.reply('Gunakan: *hero <nama hero>*');
        
        const heroName = args.join(' ');
        const hero = await detailHeroEmel(heroName);
        
        if (typeof hero === 'string') return m.reply(hero);

        let text = `*Nama Hero : ${hero.name}*\n\n`;
        text += `📖 *Latar Belakang:*\n${hero.lore}\n\n`;
        text += `📊 *Statistik Dasar:*\n`;
        for (const [key, value] of Object.entries(hero.baseStats)) {
            text += `- ${key}: ${value}\n`;
        }

        text += `\n🎭 *Kemampuan:*\n${hero.abilities.join('\n') || 'Tidak tersedia.'}`;

        return conn.sendMessage(m.chat, { image: { url: hero.image }, caption: text.trim() }, { quoted: m });
    }
};

handler.help = ['listhero', 'heroml'].map(v => v + ' ');
handler.command = /^(listhero|heroml)$/i;
handler.tags = ['game'];
handler.limit = false;

export default handler;