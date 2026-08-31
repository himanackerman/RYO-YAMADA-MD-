import { resolve, dirname as _dirname } from 'path';
import _fs, { existsSync, readFileSync } from 'fs';
const { promises: fs } = _fs;

class Database {
    /**
     * Create new Database
     * @param {String} filepath Path to specified JSON database
     * @param  {...any} args JSON.stringify arguments
     */
    constructor(filepath, ...args) {
        this.file = resolve(filepath);
        this.logger = console;
        this._load();
        this._jsonargs = args;
        this._state = false;
        this._queue = [];

        // Use a timeout instead of interval for better efficiency
        this._processQueue();
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
        this.save();
    }

    /**
     * Queue Load
     */
    load() {
        this._queue.push('_load');
        this._processQueue(); // Process immediately after adding to queue
    }

    /**
     * Queue Save
     */
    save() {
        this._queue.push('_save');
        this._processQueue(); // Process immediately after adding to queue
    }

    async _processQueue() {
        if (this._state || !this._queue.length) return;

        this._state = true;
        const method = this._queue.shift();

        try {
            await this[method]();
        } catch (error) {
            this.logger.error(`Error processing ${method}: ${error.message}`);
        } finally {
            this._state = false;
            // Continue processing the queue
            this._processQueue();
        }
    }

    /**
     * Load data from the JSON file
     */
    _load() {
        try {
            this._data = existsSync(this.file) ? JSON.parse(readFileSync(this.file)) : {};
        } catch (error) {
            this.logger.error(`Failed to load data: ${error.message}`);
            this._data = {}; // Default to empty object on error
        }
    }

    /**
     * Save data to the JSON file
     */
    async _save() {
        try {
            const dirname = _dirname(this.file);
            if (!existsSync(dirname)) await fs.mkdir(dirname, { recursive: true });
            await fs.writeFile(this.file, JSON.stringify(this._data, ...this._jsonargs));
            this.logger.info(`Data saved to ${this.file}`);
            return this.file;
        } catch (error) {
            this.logger.error(`Failed to save data: ${error.message}`);
            throw new Error('Save operation failed'); // Throw error for better handling
        }
    }

    /**
     * Delete a key from the database
     * @param {String} key The key to be deleted
     */
    delete(key) {
        if (this._data[key]) {
            delete this._data[key];
            this.save();
        } else {
            this.logger.warn(`Key "${key}" not found in data.`);
        }
    }
}

export default Database;

// ========== TAMBAHAN: USER DATABASE INIT (dipindah dari handler.js) ==========
export function initUser(sender, name = '') {
    if (typeof global.db.data.users[sender] !== 'object')
        global.db.data.users[sender] = {}

    let user = global.db.data.users[sender]
    const defaults = {
        registered: false,
        name: name || '',
        nama: '',
        username: '',
        age: -1,
        regTime: -1,

        level: 0,
        exp: 0,
        totalexp: 0,
        limit: 100,
        freelimit: 0,
        warn: 0,
        warned: 0,

        afk: -1,
        afkReason: '',

        banned: false,
        banReason: '',
        role: 'Free user',
        autolevelup: false,

        premium: false,
        premiumTime: 0,

        money: 0,
        bank: 0,
        atm: 0,
        fullatm: 0,
        chip: 0,

        health: 100,
        maxHealth: 100,
        energy: 100,
        stamina: 100,
        sleep: 100,

        potion: 0,
        trash: 0,
        wood: 0,
        rock: 0,
        string: 0,
        iron: 0,
        gold: 0,
        emerald: 0,
        diamond: 0,

        common: 0,
        uncommon: 0,
        mythic: 0,
        legendary: 0,

        petfood: 0,
        pet: 0,
        umpan: 0,

        botol: 0,
        kardus: 0,
        kaleng: 0,
        gelas: 0,
        plastik: 0,

        gandum: 0,
        minyak: 0,
        garam: 0,

        apel: 0,
        anggur: 0,
        jeruk: 0,
        mangga: 0,
        pisang: 0,

        bibitapel: 0,
        bibitanggur: 0,
        bibitjeruk: 0,
        bibitmangga: 0,
        bibitpisang: 0,

        makanan: 0,

        ayam: 0,
        babi: 0,
        babihutan: 0,
        banteng: 0,
        buaya: 0,
        gajah: 0,
        harimau: 0,
        kambing: 0,
        kerbau: 0,
        monyet: 0,
        panda: 0,
        sapi: 0,

        paus: 0,
        kepiting: 0,
        gurita: 0,
        cumi: 0,
        buntal: 0,
        dory: 0,
        lumba: 0,
        lobster: 0,
        hiu: 0,
        udang: 0,
        orca: 0,

        ikan: 0,
        lele: 0,
        nila: 0,
        bawal: 0,

        steak: 0,
        ayam_goreng: 0,
        ayamgoreng: 0,
        ayambakar: 0,
        ribs: 0,
        roti: 0,
        udang_goreng: 0,
        udangbakar: 0,
        bacon: 0,

        ikanbakar: 0,
        lelebakar: 0,
        nilabakar: 0,
        bawalbakar: 0,
        kepitingbakar: 0,
        pausbakar: 0,
        babipanggang: 0,
        oporayam: 0,
        rendang: 0,
        gulai: 0,

        aqua: 0,
        clay: 0,
        coal: 0,

        ojek: 0,
        polisi: 0,
        roket: 0,
        rokets: 0,
        taxy: 0,

        horse: 0,
        horseexp: 0,

        cat: 0,
        catexp: 0,

        dog: 0,
        dogexp: 0,

        fox: 0,
        foxexp: 0,

        robo: 0,
        roboexp: 0,

        dragon: 0,
        dragonexp: 0,

        lion: 0,
        lionexp: 0,

        rhinoceros: 0,
        rhinocerosexp: 0,

        centaur: 0,
        centaurexp: 0,

        kyubi: 0,
        kyubiexp: 0,

        griffin: 0,
        griffinexp: 0,

        phonix: 0,
        phonixexp: 0,

        wolf: 0,
        wolfexp: 0,

        horselastfeed: 0,
        catlastfeed: 0,
        doglastfeed: 0,
        foxlastfeed: 0,
        robolastfeed: 0,
        dragonlastfeed: 0,
        lionlastfeed: 0,
        rhinoceroslastfeed: 0,
        centaurlastfeed: 0,
        kyubilastfeed: 0,
        griffinlastfeed: 0,
        phonixlastfeed: 0,
        wolflastfeed: 0,

        armor: 0,
        armordurability: 0,

        sword: 0,
        sworddurability: 0,

        pickaxe: 0,
        pickaxedurability: 0,

        fishingrod: 0,
        fishingroddurability: 0,

        robodurability: 0,

        lockBankCD: 0,
        lasthackbank: 0,

        lastadventure: 0,
        lastkill: 0,
        lastmisi: 0,
        lastdungeon: 0,
        lastwar: 0,
        lastsda: 0,
        lastduel: 0,
        lastmining: 0,
        lasthunt: 0,
        lastgift: 0,
        lastberkebon: 0,
        lastdagang: 0,
        lasthourly: 0,
        lastbansos: 0,
        lastrampok: 0,
        lastclaim: 0,
        lastnebang: 0,
        lastweekly: 0,
        lastmonthly: 0,

        lastDailyQuest: 0,
        lastHero: 0,
        lastKerjaRPG: 0,
        lastKoboy: 0,
        lastNotified: 0,
        lastcode: 0,
        lastgrab: 0,
        lastmaling: 0,
        lastmulung: 0,

        bunuh: 0,
        like: 0,

        subscribers: 0,
        viewers: 0,

        ownerWelcome: false,

        youtube_account: '',
        tiktok: '',

        senjata: 0,
        sand: 0,

        dailyQuest: {},

        jailUntil: 0,

        racing: {
            car: '',
            track: '',
            races: 0,
            wins: 0,
            losses: 0,
            coins: 0,
            recordTime: 0
        },

        cafe: {
            name: 'Kafe Pemula',
            level: 1,
            capacity: 10,
            stock: 20,
            maxStock: 20,
            popularity: 0,
            rating: 5,
            revenue: 0,
            upgradeCost: 50000,
            menu: []
        },

        pelabuhanLevel: 1,
        pelabuhanMaxPenumpang: 10,
        pelabuhanSaldo: 100,
        pelabuhanPendapatanPerPenumpang: 5,
        pelabuhanJumlahPenumpang: 0,
        pelabuhanBiayaUpgrade: 50,
        pelabuhanLastBermain: 0,
        pelabuhanCooldown: 1,

        attributes: {},
        attrs: {},

        count: 0,
        last: 0,

        items: [],

        currentGame: null,
        isPlaying: false,

        pasangan: '',
        pacar: '',
        jadian: false,
        jadianTime: 0,

        rpg: {
            hp: 100,
            gold: 0,
            skillCooldown: 0
        }
    }
    for (let key in defaults) if (!(key in user)) user[key] = defaults[key]

    return user
}

// ========== TAMBAHAN: CHAT DATABASE INIT (dipindah dari handler.js) ==========
export function initChat(chatId) {
    if (typeof global.db.data.chats[chatId] !== 'object')
        global.db.data.chats[chatId] = {}

    let chat = global.db.data.chats[chatId]
    const chatDefaults = {
        isBanned: false, welcome: false, detect: false, sWelcome: '', sBye: '', sPromote: '', sDemote: '',
        delete: false, mutegc: false,
        antiLink: false, viewonce: false, antiToxic: false, simi: false, autogpt: false, autoSticker: false, premium: false, premiumTime: false, nsfw: false, menu: true, rpgs: true, expired: 0
    }
    for (let key in chatDefaults) if (!(key in chat)) chat[key] = chatDefaults[key]

    return chat
}

// ========== TAMBAHAN: SETTINGS INIT (dipindah dari handler.js) ==========
export function initSettings(botJid) {
    if (typeof global.db.data.settings[botJid] !== 'object')
        global.db.data.settings[botJid] = {}

    let settings = global.db.data.settings[botJid]
    const settingDefaults = { self: false, autoread: false, anticall: true, restartDB: 0, restrict: false }
    for (let key in settingDefaults) if (!(key in settings)) settings[key] = settingDefaults[key]

    return settings
}
