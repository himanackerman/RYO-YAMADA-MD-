/**
 * 🍌 Nano-Banana AI Multi-Engine
 * Author: Omegatech
 * Version: 5.0 (Collector Mode)
 *
 * 📡 OFFICIAL CHANNELS:
 * WhatsApp: https://whatsapp.com/channel/0029Vb785rSBlHpWSitPY61i
 * Telegram: https://t.me/+OrLFsvjjlVM2ZjRk
 */

import axios from 'axios';
import FormData from 'form-data';

let bananaSession = {};

async function uploadMedia(m) {
    try {
        const q = m.quoted ? m.quoted : m;
        if (!/image/.test(q.mimetype || q.msg?.mimetype)) return null;
        const media = await q.download();
        const form = new FormData();
        form.append('file', media, { filename: 'image.jpg' });
        form.append('type', 'permanent');
        const res = await axios.post('https://tmp.malvryx.dev/upload', form, { 
            headers: form.getHeaders() 
        });
        return res.data?.cdnUrl || res.data?.directUrl || null;
    } catch (e) { 
        return null; 
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const isNanoPro = /nanopro/i.test(command);
    const prompt = text || m.quoted?.text || m.msg?.caption || "";

    if (isNanoPro) {
        if (!bananaSession[userId]) bananaSession[userId] = { images: [] };

        if (text?.toLowerCase().startsWith('done')) {
            const session = bananaSession[userId];
            const finalPrompt = text.replace(/done/i, '').trim();

            if (session.images.length < 2) return m.reply("⚠️ *Nano-Banana Pro*\n\nPlease add at least 2 images before finishing.");
            if (!finalPrompt) return m.reply(`⚠️ *Prompt Required*\n\nUsage: ${usedPrefix + command} done <your prompt>`);

            await m.react('🕒');
            try {
                let apiUrl = `https://omegatech-api.dixonomega.tech/api/ai/nanobana-pro-v3?prompt=${encodeURIComponent(finalPrompt)}`;
                session.images.forEach((url, i) => { 
                    apiUrl += `&image${i + 1}=${encodeURIComponent(url)}`; 
                });

                const { data: initRes } = await axios.get(apiUrl);
                if (!initRes.success) throw new Error('API failed to initiate blend.');

                const taskId = initRes.task_id;
                let resultUrl = null;
                let attempts = 0;

                while (!resultUrl && attempts < 25) {
                    await new Promise(r => setTimeout(r, 5000));
                    const { data: check } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${taskId}`);
                    if (check.status === 'completed' && check.image_url) {
                        resultUrl = check.image_url;
                        break;
                    }
                    if (check.status === 'failed') throw new Error('Server reported generation failure.');
                    attempts++;
                }

                if (!resultUrl) throw new Error('Generation timed out.');

                await conn.sendMessage(m.chat, { 
                    image: { url: resultUrl }, 
                    caption: `🍌 *NANO-BANANA PRO SUCCESS*\n\n🖼️ *Images Blended:* ${session.images.length}\n📝 *Prompt:* ${finalPrompt}\n🚀 *Source:* Omegatech API` 
                }, { quoted: m });

                await m.react('✅');
                delete bananaSession[userId];
            } catch (e) {
                await m.react('❌');
                m.reply(`❌ *Error:* ${e.message}`);
                delete bananaSession[userId];
            }
            return;
        }

        const link = await uploadMedia(m);
        if (!link) return m.reply(`📸 *Collector Mode*\n\nQuote or send an image with *${usedPrefix + command}* to add it to the list.\n\nType *${usedPrefix + command} done <prompt>* when finished.`);
        
        if (bananaSession[userId].images.length >= 4) return m.reply("❌ *Limit Reached*\n\nMaximum of 4 images allowed.");
        
        bananaSession[userId].images.push(link);
        await m.react('📥');
        return m.reply(`✅ *Image ${bananaSession[userId].images.length}/4 Added*\n\nSend another image or type:\n*${usedPrefix + command} done <prompt>*`);
    }

    if (command === 'nano') {
        const imageUrl = await uploadMedia(m);
        
        if (imageUrl) {
            if (!prompt) return m.reply(`⚠️ *Instruction Required*\n\nExample: Reply to an image with \`${usedPrefix}nano make it a zombie\``);
            
            await m.react('🎨');
            try {
                const { data: init } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageUrl)}`);
                
                let resultUrl = null;
                for (let i = 0; i < 20; i++) {
                    await new Promise(r => setTimeout(r, 5000));
                    const { data: check } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${init.task_id}`);
                    if (check.status === 'completed') { resultUrl = check.image_url; break; }
                }

                if (resultUrl) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: resultUrl }, 
                        caption: `✨ *NANO EDIT SUCCESS*\n\n📝 *Prompt:* ${prompt}` 
                    }, { quoted: m });
                    await m.react('✅');
                }
            } catch (e) {
                await m.react('❌');
                m.reply("❌ Image edit failed.");
            }
        } else {
            if (!prompt) return m.reply(`⚠️ *Input Required*\n\nUsage: ${usedPrefix}nano <prompt>`);
            
            await m.react('⏳');
            try {
                const { data } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana-pro?prompt=${encodeURIComponent(prompt)}`);
                if (data.image) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: data.image }, 
                        caption: `🍌 *NANO PRO GENERATION*\n\n📝 *Prompt:* ${prompt}` 
                    }, { quoted: m });
                    await m.react('✅');
                }
            } catch (e) {
                await m.react('❌');
                m.reply("❌ Generation failed.");
            }
        }
    }
};

handler.help = ['nano', 'nanopro'];
handler.tags = ['ai'];
handler.command = /^(nanopro|nano)$/i;

export default handler;