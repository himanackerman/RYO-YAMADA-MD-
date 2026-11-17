// tts-queue.js - Fixed version using correct Gradio API endpoints
import axios from 'axios';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

const IFRAME_URL = 'https://plachta-vits-umamusume-voice-synthesizer.hf.space';

// Character and language lists from the material
const CHAR_LIST = [
    '特别周 Special Week (Umamusume Pretty Derby)', '无声铃鹿 Silence Suzuka (Umamusume Pretty Derby)',
    '东海帝王 Tokai Teio (Umamusume Pretty Derby)', '丸善斯基 Maruzensky (Umamusume Pretty Derby)',
    '富士奇迹 Fuji Kiseki (Umamusume Pretty Derby)', '小栗帽 Oguri Cap (Umamusume Pretty Derby)',
    '黄金船 Gold Ship (Umamusume Pretty Derby)', '伏特加 Vodka (Umamusume Pretty Derby)',
    '大和赤骥 Daiwa Scarlet (Umamusume Pretty Derby)', '大树快车 Taiki Shuttle (Umamusume Pretty Derby)',
    '草上飞 Grass Wonder (Umamusume Pretty Derby)', '菱亚马逊 Hishi Amazon (Umamusume Pretty Derby)',
    '目白麦昆 Mejiro Mcqueen (Umamusume Pretty Derby)', '神鹰 El Condor Pasa (Umamusume Pretty Derby)',
    '好歌剧 T.M. Opera O (Umamusume Pretty Derby)', '成田白仁 Narita Brian (Umamusume Pretty Derby)',
    '鲁道夫象征 Symboli Rudolf (Umamusume Pretty Derby)', '气槽 Air Groove (Umamusume Pretty Derby)',
    '爱丽数码 Agnes Digital (Umamusume Pretty Derby)', '青云天空 Seiun Sky (Umamusume Pretty Derby)',
    '玉藻十字 Tamamo Cross (Umamusume Pretty Derby)', '美妙 姿势 Fine Motion (Umamusume Pretty Derby)',
    '琵琶晨光 Biwa Hayahide (Umamusume Pretty Derby)', '重炮 Mayano Topgun (Umamusume Pretty Derby)',
    '曼城茶座 Manhattan Cafe (Umamusume Pretty Derby)', '美普波旁 Mihono Bourbon (Umamusume Pretty Derby)',
    '目白雷恩 Mejiro Ryan (Umamusume Pretty Derby)', '雪之美人 Yukino Bijin (Umamusume Pretty Derby)',
    '米浴 Rice Shower (Umamusume Pretty Derby)', '艾尼斯风神 Ines Fujin (Umamusume Pretty Derby)',
    '爱丽速子 Agnes Tachyon (Umamusume Pretty Derby)', '爱慕织姬 Admire Vega (Umamusume Pretty Derby)',
    '稻荷一 Inari One (Umamusume Pretty Derby)', '胜利奖券 Winning Ticket (Umamusume Pretty Derby)',
    '空中神宫 Air Shakur (Umamusume Pretty Derby)', '荣进闪耀 Eishin Flash (Umamusume Pretty Derby)',
    '真机伶 Curren Chan (Umamusume Pretty Derby)', '川上公主 Kawakami Princess (Umamusume Pretty Derby)',
    '黄金城市 Gold City (Umamusume Pretty Derby)', '樱花进王 Sakura Bakushin O (Umamusume Pretty Derby)',
    '采珠 Seeking the Pearl (Umamusume Pretty Derby)', '新光风 Shinko Windy (Umamusume Pretty Derby)',
    '东商变革 Sweep Tosho (Umamusume Pretty Derby)', '超级小溪 Super Creek (Umamusume Pretty Derby)',
    '醒目飞鹰 Smart Falcon (Umamusume Pretty Derby)', '荒 漠英雄 Zenno Rob Roy (Umamusume Pretty Derby)',
    '东瀛佐敦 Tosen Jordan (Umamusume Pretty Derby)', '中山庆典 Nakayama Festa (Umamusume Pretty Derby)',
    '成田大进 Narita Taishin (Umamusume Pretty Derby)', '西野花 Nishino Flower (Umamusume Pretty Derby)',
    '春乌拉拉 Haru Urara (Umamusume Pretty Derby)', '青竹回忆 Bamboo Memory (Umamusume Pretty Derby)',
    '待兼福来 Matikane Fukukitaru (Umamusume Pretty Derby)', '名将怒涛 Meisho Doto (Umamusume Pretty Derby)',
    '目白多伯 Mejiro Dober (Umamusume Pretty Derby)', '优秀素质 Nice Nature (Umamusume Pretty Derby)',
    '帝 王光环 King Halo (Umamusume Pretty Derby)', '待兼诗歌剧 Matikane Tannhauser (Umamusume Pretty Derby)',
    '生野狄杜斯 Ikuno Dictus (Umamusume Pretty Derby)', '目白善信 Mejiro Palmer (Umamusume Pretty Derby)',
    '大 拓太阳神 Daitaku Helios (Umamusume Pretty Derby)', '双涡轮 Twin Turbo (Umamusume Pretty Derby)',
    '里见光钻 Satono Diamond (Umamusume Pretty Derby)', '北部玄驹 Kitasan Black (Umamusume Pretty Derby)',
    '樱花千代 王 Sakura Chiyono O (Umamusume Pretty Derby)', '天狼星象征 Sirius Symboli (Umamusume Pretty Derby)',
    '目白阿尔丹 Mejiro Ardan (Umamusume Pretty Derby)', '八重无敌 Yaeno Muteki (Umamusume Pretty Derby)',
    '鹤丸刚志 Tsurumaru Tsuyoshi (Umamusume Pretty Derby)', '目白光明 Mejiro Bright (Umamusume Pretty Derby)',
    '樱花桂冠 Sakura Laurel (Umamusume Pretty Derby)', '成田路 Narita Top Road (Umamusume Pretty Derby)',
    '也文摄 辉 Yamanin Zephyr (Umamusume Pretty Derby)', '真弓快车 Aston Machan (Umamusume Pretty Derby)',
    '骏川手纲 Hayakawa Tazuna (Umamusume Pretty Derby)', '小林历奇 Kopano Rickey (Umamusume Pretty Derby)',
    '奇锐骏 Wonder Acute (Umamusume Pretty Derby)', '秋川理事长 President Akikawa (Umamusume Pretty Derby)',
    '綾地 寧々 Ayachi Nene (Sanoba Witch)', '因幡 めぐる Inaba Meguru (Sanoba Witch)',
    '椎葉 紬 Shiiba Tsumugi (Sanoba Witch)', '仮屋 和奏 Kariya Wakama (Sanoba Witch)',
    '戸隠 憧子 Togakushi Touko (Sanoba Witch)', '九条裟罗 Kujou Sara (Genshin Impact)',
    '芭芭 拉 Barbara (Genshin Impact)', '派蒙 Paimon (Genshin Impact)', '荒泷一 斗 Arataki Itto (Genshin Impact)',
    '早柚 Sayu (Genshin Impact)', '香菱 Xiangling (Genshin Impact)', '神里绫华 Kamisato Ayaka (Genshin Impact)',
    '重云 Chongyun (Genshin Impact)', '流浪者 Wanderer (Genshin Impact)', '优菈 Eula (Genshin Impact)',
    '凝光 Ningguang (Genshin Impact)', '钟离 Zhongli (Genshin Impact)', '雷电将军 Raiden Shogun (Genshin Impact)',
    '枫原万叶 Kaedehara Kazuha (Genshin Impact)', '赛诺 Cyno (Genshin Impact)', '诺艾尔 Noelle (Genshin Impact)',
    '八重神子 Yae Miko (Genshin Impact)', '凯亚 Kaeya (Genshin Impact)', '魈 Xiao (Genshin Impact)',
    '托马 Thoma (Genshin Impact)', '可莉 Klee (Genshin Impact)', '迪卢克 Diluc (Genshin Impact)',
    '夜兰 Yelan (Genshin Impact)', '鹿野院平藏 Shikanoin Heizou (Genshin Impact)', '辛焱 Xinyan (Genshin Impact)',
    '丽莎 Lisa (Genshin Impact)', '云堇 Yun Jin (Genshin Impact)', '坎蒂丝 Candace (Genshin Impact)',
    '罗莎莉亚 Rosaria (Genshin Impact)', '北斗 Beidou (Genshin Impact)', '珊瑚宫心海 Sangonomiya Kokomi (Genshin Impact)',
    '烟绯 Yanfei (Genshin Impact)', '久岐忍 Kuki Shinobu (Genshin Impact)', '宵宫 Yoimiya (Genshin Impact)',
    '安柏 Amber (Genshin Impact)', '迪奥娜 Diona (Genshin Impact)', '班尼特 Bennett (Genshin Impact)',
    '雷泽 Razor (Genshin Impact)', '阿贝多 Albedo (Genshin Impact)', '温迪 Venti (Genshin Impact)',
    '空 Player Male (Genshin Impact)', '神里绫人 Kamisato Ayato (Genshin Impact)', '琴 Jean (Genshin Impact)',
    '艾尔海 森 Alhaitham (Genshin Impact)', '莫娜 Mona (Genshin Impact)', '妮露 Nilou (Genshin Impact)',
    '胡桃 Hu Tao (Genshin Impact)', '甘雨 Ganyu (Genshin Impact)', '纳西妲 Nahida (Genshin Impact)',
    '刻晴 Keqing (Genshin Impact)', '荧 Player Female (Genshin Impact)', '埃洛伊 Aloy (Genshin Impact)',
    '柯莱 Collei (Genshin Impact)', '多莉 Dori (Genshin Impact)', '提纳里 Tighnari (Genshin Impact)',
    '砂糖 Sucrose (Genshin Impact)', '行秋 Xingqiu (Genshin Impact)', '奥兹 Oz (Genshin Impact)',
    '五郎 Gorou (Genshin Impact)', '达达利亚 Tartalia (Genshin Impact)', '七七 Qiqi (Genshin Impact)',
    '申鹤 Shenhe (Genshin Impact)', '莱依拉 Layla (Genshin Impact)', '菲谢尔 Fishl (Genshin Impact)'
];

const LANG_LIST = [
    "日本語",
    "简体中文",
    "English",
    "Mix"
];

class TTSQueue extends EventEmitter {
    constructor() {
        super();
        this.client = axios.create({
            baseURL: IFRAME_URL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Referer': 'https://huggingface.co/spaces/Plachta/VITS-Umamusume-voice-synthesizer',
                'Origin': IFRAME_URL,
            },
            timeout: 300000,
            withCredentials: true
        });
        
        // Helper functions
        this.pickValue = (input, list, fallbackIndex = 0) => {
            if (typeof input === "number") {
                return list[input - 1] ?? list[fallbackIndex];
            }
            
            if (typeof input === "string") {
                const found = list.find(v =>
                    v.toLowerCase().includes(input.toLowerCase())
                );
                return found ?? list[fallbackIndex];
            }

            return list[fallbackIndex];
        };
    }

    async joinQueue(fnIndex, data, sessionHash) {
        console.log('Joining queue...');
        
        // Based on the material, the correct endpoint is /gradio_api/queue/join
        const payload = {
            data: data,
            event_data: null,
            fn_index: fnIndex,
            session_hash: sessionHash,
            trigger_id: fnIndex === 2 ? 24 : 28 // From the material: trigger_id 24 for fn_index 2
        };

        try {
            const response = await this.client.post('/gradio_api/queue/join', payload);
            console.log('Queue join response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Queue join error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    async getQueueStatus(sessionHash) {
        try {
            const response = await this.client.get(`/gradio_api/queue/data?session_hash=${sessionHash}`, {
                responseType: 'text'
            });
            
            // Parse Server-Sent Events (SSE) format
            const lines = response.data.split('\n');
            for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                
                try {
                    const json = JSON.parse(line.replace('data: ', '').trim());
                    return json;
                } catch (e) {
                    continue;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Queue status error:', error.message);
            throw error;
        }
    }

    async waitForCompletion(sessionHash, timeout = 120000, pollInterval = 1000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const status = await this.getQueueStatus(sessionHash);
                
                if (!status) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    continue;
                }
                
                console.log('Queue status:', status.msg || 'Unknown');
                
                if (status.msg === 'process_completed') {
                    return status;
                } else if (status.msg === 'process_generating') {
                    this.emit('progress', status);
                } else if (status.msg === 'estimation') {
                    console.log(`Estimated wait time: ${status.rank_eta} seconds`);
                } else if (status.msg === 'queue_full') {
                    throw new Error('Queue is full');
                }
                
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            } catch (error) {
                if (error.response?.status === 422) {
                    // Session not found yet, continue waiting
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    continue;
                }
                throw error;
            }
        }
        
        throw new Error('Timeout waiting for completion');
    }

    async generateTTS(text, options = {}) {
        const {
            character = "春乌拉拉 Haru Urara (Umamusume Pretty Derby)",
            language = "日本語",
            speed = 1.0,
            tab = "Japanese", // "Trilingual" or "Japanese"
            useSymbolInput = false
        } = options;

        const sessionHash = Math.random().toString(36).substring(2, 15);
        
        // Based on the material: fn_index 2 for Trilingual, but let's test both
        const fnIndex = tab === "Trilingual" ? 2 : 2; // Both use fn_index 2 according to material

        // Pick correct values from lists
        const charValue = this.pickValue(character, CHAR_LIST, 0);
        const langValue = this.pickValue(language, LANG_LIST, 0);

        // Based on the material: [text, character, language, speed, noise]
        // But from the request example: ["こんにちわ。","特别周 Special Week...","日本語",5,false]
        const inputData = [
            text,
            charValue,
            langValue,
            speed,
            useSymbolInput // noise parameter
        ];

        console.log('Generating TTS with:');
        console.log('- Text:', text);
        console.log('- Character:', charValue);
        console.log('- Language:', langValue);
        console.log('- Speed:', speed);
        console.log('- Tab:', tab);
        console.log('- Session hash:', sessionHash);
        console.log('- FN Index:', fnIndex);

        try {
            // Step 1: Join queue
            const joinResult = await this.joinQueue(fnIndex, inputData, sessionHash);
            
            if (!joinResult || joinResult.msg === 'queue_full') {
                throw new Error('Queue is full. Please try again later.');
            }

            // Step 2: Wait for completion
            const completion = await this.waitForCompletion(sessionHash);
            
            // Step 3: Extract result
            if (completion.output && completion.output.data) {
                const outputData = completion.output.data;
                console.log('Output data received, length:', outputData.length);
                
                // Find audio file path
                for (let i = 0; i < outputData.length; i++) {
                    const item = outputData[i];
                    
                    if (typeof item === 'string') {
                        if (item.includes('.wav') || item.includes('.mp3')) {
                            // Audio file path found
                            const audioPath = item;
                            const audioUrl = `${IFRAME_URL}/gradio_api/file=${audioPath}`;
                            
                            console.log('Audio URL:', audioUrl);
                            
                            return {
                                success: true,
                                text: text,
                                audio_url: audioUrl,
                                file_path: audioPath,
                                session_hash: sessionHash,
                                full_response: completion
                            };
                        }
                    }
                }
            }
            
            // Try alternative location
            if (completion.output && completion.output.data && completion.output.data[0]) {
                const item = completion.output.data[0];
                if (item && item.name && item.name.endsWith('.wav')) {
                    const audioUrl = `${IFRAME_URL}/gradio_api/file=${item.name}`;
                    return {
                        success: true,
                        text: text,
                        audio_url: audioUrl,
                        session_hash: sessionHash,
                        full_response: completion
                    };
                }
            }
            
            // If no audio found, return the full response
            return {
                success: false,
                text: text,
                message: 'No audio found in response',
                full_response: completion,
                session_hash: sessionHash
            };
            
        } catch (error) {
            console.error('TTS generation failed:', error.message);
            console.error('Error stack:', error.stack);
            
            return {
                success: false,
                error: error.message,
                session_hash: sessionHash
            };
        }
    }

    async downloadAudio(audioUrl, outputPath = null) {
        try {
            const response = await axios({
                method: 'GET',
                url: audioUrl,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': IFRAME_URL
                }
            });

            if (!outputPath) {
                const timestamp = Date.now();
                outputPath = `tts_output_${timestamp}.wav`;
            }

            const writer = fs.createWriteStream(outputPath);
            
            return new Promise((resolve, reject) => {
                response.data.pipe(writer);
                
                writer.on('finish', () => {
                    console.log(`Audio downloaded: ${outputPath}`);
                    resolve({
                        success: true,
                        file_path: outputPath,
                        size: fs.statSync(outputPath).size
                    });
                });
                
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('Download failed:', error.message);
            throw error;
        }
    }

    async simpleTTS(text, character = 1, language = 1, speed = 1.0, noise = false) {
        // Simplified version based on the material's example
        const charValue = this.pickValue(character, CHAR_LIST, 0);
        const langValue = this.pickValue(language, LANG_LIST, 0);
        const sessionHash = Math.random().toString(36).slice(2);
        
        console.log(`Generating TTS: "${text}" with ${charValue} in ${langValue}`);
        
        try {
            // Join queue
            const joinResponse = await this.client.post('/gradio_api/queue/join', {
                data: [
                    text,
                    charValue,
                    langValue,
                    speed,
                    noise
                ],
                event_data: null,
                fn_index: 2,
                session_hash: sessionHash,
                trigger_id: 24
            });
            
            console.log('Join response:', joinResponse.data);
            
            // Wait for completion
            let attempt = 0;
            const maxAttempts = 60;
            
            while (attempt < maxAttempts) {
                await this.sleep(2000);
                attempt++;
                
                try {
                    const statusRes = await axios.get(
                        `${IFRAME_URL}/gradio_api/queue/data?session_hash=${sessionHash}`,
                        { responseType: "text" }
                    );
                    
                    const lines = statusRes.data.split('\n');
                    for (const line of lines) {
                        if (!line.startsWith('data:')) continue;
                        
                        const json = JSON.parse(line.replace('data: ', ''));
                        
                        if (json.msg === 'process_completed') {
                            console.log('Process completed');
                            
                            // Extract audio URL
                            if (json.output && json.output.data) {
                                for (const item of json.output.data) {
                                    if (typeof item === 'string' && item.includes('.wav')) {
                                        const audioUrl = `${IFRAME_URL}/gradio_api/file=${item}`;
                                        return {
                                            success: true,
                                            text: text,
                                            audio_url: audioUrl,
                                            session_hash: sessionHash
                                        };
                                    }
                                }
                            }
                            
                            return json;
                        }
                    }
                } catch (error) {
                    console.log(`Attempt ${attempt}: ${error.message}`);
                }
            }
            
            throw new Error('Timeout waiting for TTS generation');
            
        } catch (error) {
            console.error('TTS generation error:', error.message);
            return {
                success: false,
                error: error.message,
                session_hash: sessionHash
            };
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async exploreAPI() {
        console.log('=== API EXPLORATION ===');
        
        const endpoints = [
            '/gradio_api/queue/join',
            '/gradio_api/queue/data',
            '/gradio_api/file=/tmp/gradio/test.wav',
            '/config',
            '/api/predict'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await this.client.get(endpoint, { timeout: 5000 });
                console.log(`GET ${endpoint}: ${response.status}`);
                if (response.data && typeof response.data === 'object') {
                    console.log(`  Data keys: ${Object.keys(response.data).join(', ')}`);
                }
            } catch (error) {
                console.log(`GET ${endpoint}: ${error.response?.status || error.message}`);
            }
        }
    }

    getCharacterList() {
        return CHAR_LIST;
    }

    getLanguageList() {
        return LANG_LIST;
    }
}

// Example usage function
async function exampleUsage() {
    const tts = new TTSQueue();
    
    console.log('Testing simple TTS...');
    
    // Method 1: Simple version (closest to the material example)
    const result = await tts.simpleTTS(
        'こんにちは、元気ですか？',
        1, // Character index or name
        1, // Language index or name
        1.0, // Speed
        false // Noise
    );
    
    console.log('\nResult:', result);
    
    if (result.success && result.audio_url) {
        console.log(`\nAudio URL: ${result.audio_url}`);
        
        // Download the audio
        try {
            const downloadResult = await tts.downloadAudio(result.audio_url);
            console.log('Download result:', downloadResult);
        } catch (error) {
            console.error('Download error:', error.message);
        }
    }
    
    return result;
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node tts-queue.js <text> [options]');
        console.log('Examples:');
        console.log('  node tts-queue.js "こんにちは"');
        console.log('  node tts-queue.js "Hello" --lang 3');
        console.log('  node tts-queue.js "你好" --char "派蒙 Paimon (Genshin Impact)"');
        console.log('\nOptions:');
        console.log('  --char <name_or_index>  Character name or index (default: 1)');
        console.log('  --lang <name_or_index>  Language (1=日本語, 2=简体中文, 3=English, 4=Mix)');
        console.log('  --speed <number>        Speed (default: 1.0)');
        console.log('  --noise <true/false>    Add noise (default: false)');
        console.log('  --output <path>         Output file path (optional)');
        console.log('\nAvailable characters:', CHAR_LIST.length);
        console.log('Available languages:', LANG_LIST.join(', '));
        return;
    }
    
    const tts = new TTSQueue();
    
    // Parse arguments
    const text = args[0];
    let character = 1;
    let language = 1;
    let speed = 1.0;
    let noise = false;
    let outputPath = null;
    
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--char') {
            const value = args[i + 1];
            if (isNaN(value)) {
                character = value;
            } else {
                character = parseInt(value);
            }
            i++;
        } else if (args[i] === '--lang') {
            const value = args[i + 1];
            if (isNaN(value)) {
                language = value;
            } else {
                language = parseInt(value);
            }
            i++;
        } else if (args[i] === '--speed') {
            speed = parseFloat(args[i + 1]);
            i++;
        } else if (args[i] === '--noise') {
            noise = args[i + 1].toLowerCase() === 'true';
            i++;
        } else if (args[i] === '--output') {
            outputPath = args[i + 1];
            i++;
        } else if (args[i] === '--list-chars') {
            console.log('\n=== AVAILABLE CHARACTERS ===');
            CHAR_LIST.forEach((char, index) => {
                console.log(`${index + 1}. ${char}`);
            });
            return;
        } else if (args[i] === '--list-langs') {
            console.log('\n=== AVAILABLE LANGUAGES ===');
            LANG_LIST.forEach((lang, index) => {
                console.log(`${index + 1}. ${lang}`);
            });
            return;
        }
    }
    
    console.log(`Generating TTS for: "${text}"`);
    console.log(`Character: ${tts.pickValue(character, CHAR_LIST)}`);
    console.log(`Language: ${tts.pickValue(language, LANG_LIST)}`);
    console.log(`Speed: ${speed}`);
    console.log(`Noise: ${noise}`);
    
    const result = await tts.simpleTTS(text, character, language, speed, noise);
    
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.audio_url) {
        console.log(`\nAudio URL: ${result.audio_url}`);
        
        // Download if output path specified or auto-download
        if (outputPath || true) { // Auto-download by default
            const finalOutputPath = outputPath || `tts_output_${Date.now()}.wav`;
            try {
                await tts.downloadAudio(result.audio_url, finalOutputPath);
                console.log(`Audio saved to: ${finalOutputPath}`);
            } catch (error) {
                console.error('Failed to download audio:', error.message);
            }
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default TTSQueue;
export { CHAR_LIST, LANG_LIST };
