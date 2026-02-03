// Plugin: soundmeme-random 
// Plugins ESM 
// Source API : https://api.sxtream.xyz/
let handler = async (m, { conn }) => {
  let data = [
    // 🔊 List awal
    { title: "VINE BOOM SOUND", audio: "https://www.myinstants.com/media/sounds/vine-boom.mp3" },
    { title: "Suara Rem Truk", audio: "https://www.myinstants.com/media/sounds/suara-rem-truk-sumatra-sulawesi-kalimantan.mp3" },
    { title: "AKH", audio: "https://www.myinstants.com/media/sounds/akh.mp3" },
    { title: "Hidup jokowi !!!", audio: "https://www.myinstants.com/media/sounds/hidup-jokowi.mp3" },
    { title: "Fart", audio: "https://www.myinstants.com/media/sounds/dry-fart.mp3" },
    { title: "Tuco: GET OUT", audio: "https://www.myinstants.com/media/sounds/tuco-get-out.mp3" },
    { title: "Anime Wow", audio: "https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3" },
    { title: "Among Us role", audio: "https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3" },
    { title: "SpongeBob Fail", audio: "https://www.myinstants.com/media/sounds/spongebob-fail.mp3" },
    { title: "BRUH", audio: "https://www.myinstants.com/media/sounds/movie_1.mp3" },
    { title: "rizz sound effect", audio: "https://www.myinstants.com/media/sounds/rizz-sound-effect.mp3" },
    { title: "Sad Violin", audio: "https://www.myinstants.com/media/sounds/tf_nemesis.mp3" },
    { title: "cat laugh meme 1", audio: "https://www.myinstants.com/media/sounds/cat-laugh-meme-1.mp3" },
    { title: "Adit tolongin dit", audio: "https://www.myinstants.com/media/sounds/adit-tolongin-dit.mp3" },
    { title: "ding sound effect", audio: "https://www.myinstants.com/media/sounds/ding-sound-effect_2.mp3" },
    { title: "instagram thud", audio: "https://www.myinstants.com/media/sounds/vine-boom-sound-effect_KT89XIq.mp3" },
    { title: "Mac Quack", audio: "https://www.myinstants.com/media/sounds/mac-quack.mp3" },
    { title: "Ngakak laugh", audio: "https://www.myinstants.com/media/sounds/ngakak-laugh-annoying.mp3" },
    { title: "ACK", audio: "https://www.myinstants.com/media/sounds/ack.mp3" },
    { title: "Punch Sound", audio: "https://www.myinstants.com/media/sounds/punch-gaming-sound-effect-hd_RzlG1GE.mp3" },
    { title: "Error SOUNDSS", audio: "https://www.myinstants.com/media/sounds/error_CDOxCYm.mp3" },
    { title: "baby laughing meme", audio: "https://www.myinstants.com/media/sounds/baby-laughing-meme.mp3" },
    { title: "YAAAAAAAAY", audio: "https://www.myinstants.com/media/sounds/kids-saying-yay-sound-effect_3.mp3" },
    { title: "Basuri V3", audio: "https://www.myinstants.com/media/sounds/basuri-v3.mp3" },
    { title: "hidup lonte", audio: "https://www.myinstants.com/media/sounds/hidup-lonte.mp3" },
    { title: "Metal pipe clang", audio: "https://www.myinstants.com/media/sounds/metal-pipe-clang.mp3" },
    { title: "Alamak Najisnyee", audio: "https://www.myinstants.com/media/sounds/alamak-najisnyee.mp3" },
    { title: "eh?eh?ehhhh?", audio: "https://www.myinstants.com/media/sounds/eh-eh-ehhhh.mp3" },
    { title: "Shocked sound", audio: "https://www.myinstants.com/media/sounds/shocked-sound-effect.mp3" },
    { title: "Sexy Sax", audio: "https://www.myinstants.com/media/sounds/george-micael-wham-careless-whisper-1.mp3" },
    { title: "anime ahh", audio: "https://www.myinstants.com/media/sounds/anime-ahh.mp3" },
    { title: "Memento Mancing", audio: "https://www.myinstants.com/media/sounds/memento-mancing-mania_ymrKDvh.mp3" },
    { title: "backgroundmusic", audio: "https://www.myinstants.com/media/sounds/backgroundmusic.mp3" },
    { title: "Nothing beats jet2", audio: "https://www.myinstants.com/media/sounds/nothing-beats-a-jet2-holiday_IeBO1Mr.mp3" },
    { title: "Cartoon Slip", audio: "https://www.myinstants.com/media/sounds/cartoonslip.mp3" },

    // 🔊 List tambahan dari kamu
    { title: "spiderman meme song", audio: "https://www.myinstants.com/media/sounds/spiderman-meme-song.mp3" },
    { title: "cihuyy wielino ino", audio: "https://www.myinstants.com/media/sounds/cihuyy-wielino-ino_kO92s4H.mp3" },
    { title: "Patrick - Pembohong", audio: "https://www.myinstants.com/media/sounds/patrick-pembohong-kau-pembohong.mp3" },
    { title: "Kobo Jawa", audio: "https://www.myinstants.com/media/sounds/kobo-jawa.mp3" },
    { title: "asian meme huh?", audio: "https://www.myinstants.com/media/sounds/huh_37bAoRo.mp3" },
    { title: "Scream meme", audio: "https://www.myinstants.com/media/sounds/y2mate_5gbydy1.mp3" },
    { title: "dun dun dunnnnnnnn", audio: "https://www.myinstants.com/media/sounds/dun-dun-dun-sound-effect-brass_8nFBccR.mp3" },
    { title: "aduh gantengnya", audio: "https://www.myinstants.com/media/sounds/aduh-gantengnya.mp3" },
    { title: "Awkward cricket", audio: "https://www.myinstants.com/media/sounds/awkward-cricket-sound-effect.mp3" },
    { title: "KAK GEM PAHAM", audio: "https://www.myinstants.com/media/sounds/kak-gem-paham.mp3" },
    { title: "Meme final", audio: "https://www.myinstants.com/media/sounds/meme-de-creditos-finales.mp3" },
    { title: "Pew_Pew", audio: "https://www.myinstants.com/media/sounds/pew_pew-dknight556-1379997159.mp3" },
    { title: "ih takotnyee", audio: "https://www.myinstants.com/media/sounds/ih-takotnyee.mp3" },
    { title: "Discord Notification", audio: "https://www.myinstants.com/media/sounds/discord-notification.mp3" },
    { title: "Lagging/loading", audio: "https://www.myinstants.com/media/sounds/loading-lost-connection-green-screen-with-sound-effect-2_K8HORkT.mp3" },
    { title: "Correct Answer GameShow", audio: "https://www.myinstants.com/media/sounds/correct.mp3" },
    { title: "Ah capek ah (Komeng)", audio: "https://www.myinstants.com/media/sounds/ah-capek-ah-komeng.mp3" },
    { title: "A few moments later", audio: "https://www.myinstants.com/media/sounds/a-few-moments-later-sponge-bob-sfx-fun.mp3" },
    { title: "Wait what the hell", audio: "https://www.myinstants.com/media/sounds/wait-wait-wait-what-the-hell-legend-sound.mp3" },
    { title: "-999 Social Credit", audio: "https://www.myinstants.com/media/sounds/999-social-credit-siren.mp3" },
    { title: "ROBLOX oof", audio: "https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3" },
    { title: "Wow Anime meme", audio: "https://www.myinstants.com/media/sounds/anime-wow-sound-effect-mp3cut.mp3" },
    { title: "Fart Button", audio: "https://www.myinstants.com/media/sounds/perfect-fart.mp3" },
    { title: "running sound", audio: "https://www.myinstants.com/media/sounds/1-108.mp3" },
    { title: "BERISIK", audio: "https://www.myinstants.com/media/sounds/berisik.mp3" },
    { title: "Basuri 2", audio: "https://www.myinstants.com/media/sounds/basuri-2.mp3" },
    { title: "Rizz sounds", audio: "https://www.myinstants.com/media/sounds/rizz-sounds.mp3" },
    { title: "Oh My God Meme", audio: "https://www.myinstants.com/media/sounds/oh-my-god-meme.mp3" },
    { title: "Mouse Click Sound", audio: "https://www.myinstants.com/media/sounds/mouse-click-sound.mp3" },
    { title: "Taco Bell Bong", audio: "https://www.myinstants.com/media/sounds/taco-bell-bong-sfx.mp3" },
    { title: "Ling kek tolol", audio: "https://www.myinstants.com/media/sounds/dah-yatim-goblok-main-ling-kek-tolol-anjing.mp3" },
    { title: "Ketawa Bajaj Bajuri", audio: "https://www.myinstants.com/media/sounds/efek-sound-ketawa-bajaj-bajuri.mp3" },
    { title: "frog laughing meme", audio: "https://www.myinstants.com/media/sounds/frog-laughing-meme.mp3" },
    { title: "magic fairy", audio: "https://www.myinstants.com/media/sounds/magic-fairy.mp3" },
    { title: "Mario Jump", audio: "https://www.myinstants.com/media/sounds/maro-jump-sound-effect_1.mp3" },
    { title: "Duck toy sound", audio: "https://www.myinstants.com/media/sounds/duck-toy-sound.mp3" }
  ]

  let random = data[Math.floor(Math.random() * data.length)]
  conn.sendFile(m.chat, random.audio, 'sound.mp3', `🎵 ${random.title}`, m, null, {
    mimetype: 'audio/mpeg',
    ptt: false
  })
}

handler.help = ['soundmeme']
handler.tags = ['sound']
handler.command = /^soundmeme$/i
handler.limit = true

export default handler