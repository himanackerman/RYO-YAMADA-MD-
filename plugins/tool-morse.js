/*
Jangan Hapus Wm Bang 

*Morse,Demorse Kode  Plugins Esm*

Mungkin Anak Pramuka Butuh Entahlah 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Original Source]*

https://whatsapp.com/channel/0029ValggF79mrGXnImOmk1F/121
*/

const morseDict = {
    'a': '•–', 'b': '–•••', 'c': '–•–•', 'd': '–••', 'e': '•',
    'f': '••–•', 'g': '––•', 'h': '••••', 'i': '••', 'j': '•–––',
    'k': '–•–', 'l': '•–••', 'm': '––', 'n': '–•', 'o': '–––',
    'p': '•––•', 'q': '––•–', 'r': '•–•', 's': '•••', 't': '–',
    'u': '••–', 'v': '•••–', 'w': '•––', 'x': '–••–', 'y': '–•––',
    'z': '––••', '1': '•––––', '2': '••–––', '3': '•••––', '4': '••••–',
    '5': '•••••', '6': '–••••', '7': '––•••', '8': '–––••', '9': '––––•',
    '0': '–––––', ' ': '/'
};

const reverseMorseDict = Object.fromEntries(
    Object.entries(morseDict).map(([key, value]) => [value, key])
);

const textToMorse = (text) => {
    return text.toLowerCase().split('').map(char => {
        return morseDict[char] || char;
    }).join(' ');
};

const morseToText = (morse) => {
    return morse.split(/\/|\s/).map(word => {
        return word.split(' ').map(char => reverseMorseDict[char] || char).join('');
    }).join(' ');
};

let handler = async (m, { text, command, usedPrefix }) => {
    const isEncode = command === 'morse';
    const inputText = text || (m.quoted && m.quoted.text) || '';
    
    if (!inputText) {
        const example = isEncode ? 'hello world' : '•– / –••• / –•–• / –•• / •';
        return m.reply(`Masukkan ${isEncode ? 'teks' : 'kode morse'}!\n\nContoh:\n${usedPrefix}${command} ${example}`);
    }

    try {
        const result = isEncode ? textToMorse(inputText) : morseToText(inputText);
        m.reply(result);
    } catch (e) {
        m.reply('Terjadi kesalahan dalam konversi');
    }
};

handler.help = ['morse', 'demorse'];
handler.tags = ['fun', 'tools'];
handler.command = /^(morse|demorse)$/i;
handler.limit = false;

export default handler;