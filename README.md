<p align="center">
  <img src="https://raw.githubusercontent.com/himanackerman/Image/main/1768265694471-117.jpeg" width="380"/>
</p><h1 align="center">RYO YAMADA MD</h1><p align="center">
  <b>WhatsApp Multi-Device Bot</b><br>
  Modular • Fast • Flexible • Plugin Based
</p><p align="center">
  <img src="https://img.shields.io/github/stars/himanackerman/RYO-YAMADA-MD-?style=flat-square">
  <img src="https://img.shields.io/github/forks/himanackerman/RYO-YAMADA-MD-?style=flat-square">
  <img src="https://img.shields.io/github/license/himanackerman/RYO-YAMADA-MD-?style=flat-square">
  <a href="https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K">
    <img src="https://img.shields.io/badge/WHATSAPP_CHANNEL-25D366?style=flat-square&logo=whatsapp&logoColor=white">
  </a>
</p>---

🌙 Tentang

RYO YAMADA MD adalah bot WhatsApp Multi-Device berbasis Node.js dengan sistem plugin yang modular.

Project ini dibuat untuk hiburan, utilitas, downloader, AI, game, sticker, tools, dan berbagai kebutuhan otomatisasi WhatsApp.

Sistem plugin memungkinkan fitur dipisahkan berdasarkan kategori sehingga source code lebih mudah dikembangkan, diperbaiki, dan dipelihara.

✨ Highlights

- Multi-Device WhatsApp
- Sistem plugin modular
- Support ESM
- Downloader
- AI tools
- Sticker tools
- Group management
- Game & fun
- Search tools
- Anime features
- Owner tools
- Level & XP system
- Docker support
- Mudah dikembangkan

---

📝 Daftar Isi

- "Tentang" (#-tentang)
- "Fitur Utama" (#-fitur-utama)
- "Struktur Project" (#-struktur-project)
- "Penjelasan File" (#-penjelasan-file)
- "Struktur Plugin" (#-struktur-plugin)
- "Format Plugin" (#-format-plugin)
- "Parameter Handler" (#-parameter-handler)
- "Metadata Plugin" (#-metadata-plugin)
- "Plugin API" (#-plugin-api)
- "Requirements" (#-requirements)
- "Installation" (#-installation)
- "Configuration" (#-configuration)
- "Menjalankan Bot" (#-menjalankan-bot)
- "Termux" (#-termux)
- "Docker" (#-docker)
- "Development" (#-development)
- "Update Repository" (#-update-repository)
- "Troubleshooting" (#-troubleshooting)
- "Security" (#-security)
- "Credits" (#-credits)
- "License" (#-license)
- "Disclaimer" (#-disclaimer)

---

✨ Fitur Utama

Kategori| Deskripsi
🤖 AI| Chat AI, prompt, generator dan berbagai AI tools
📥 Downloader| Download media dari berbagai platform
🔎 Search| Pencarian berbagai informasi dan media
🎨 Sticker| Membuat dan mengolah sticker
🔊 Sound| Sound, audio dan meme
🎮 Game| Game, tebak-tebakan, RPG dan fun
👥 Group| Tools administrasi dan management grup
🛠️ Tools| Converter, QR, media tools dan utility
🎌 Anime| Berbagai fitur dan konten anime
👤 Stalk| Tools informasi publik
🎲 Random| Command random dan hiburan
📊 Level| XP, level, limit dan profile
👑 Owner| Fitur khusus owner
🧩 System| Utility dan sistem bot

---

📁 Struktur Project

Struktur utama project:

Ryo Yamada - MD/
│
├── index.js
├── main.js
├── handler.js
├── server.js
├── config.js
├── package.json
│
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── README.md
├── thumbnail.jpg
│
├── plugins/
│   ├── ai/
│   ├── anime/
│   ├── downloader/
│   ├── fun/
│   ├── game/
│   ├── group/
│   ├── search/
│   ├── sound/
│   ├── sticker/
│   ├── tools/
│   ├── voice/
│   └── ...
│
├── lib/
├── src/
├── json/
├── media/
└── tmp/

«Struktur dapat berubah mengikuti perkembangan project dan penambahan fitur.»

---

📄 Penjelasan File

"index.js"

Entry point project.

Digunakan untuk memulai proses utama bot dan menjalankan komponen yang diperlukan.

---

"main.js"

Bagian utama aplikasi yang menangani proses startup dan koneksi bot.

---

"handler.js"

Digunakan untuk memproses pesan yang masuk, mendeteksi command, menjalankan middleware, dan meneruskan command ke plugin.

Alur sederhananya:

WhatsApp
   │
   ▼
Message
   │
   ▼
Handler
   │
   ▼
Command Detection
   │
   ▼
Plugin
   │
   ▼
Response

---

"server.js"

Digunakan untuk kebutuhan HTTP/server pada project.

---

"config.js"

Konfigurasi utama bot.

Contoh:

global.owner = [...]
global.namebot = 'RYO YAMADA MD'
global.packname = '...'
global.author = '...'

Jangan menyimpan API key, token, password, session, atau credential pribadi di repository publik.

---

"package.json"

Berisi:

- Nama project
- Version
- Dependency
- NPM script
- Konfigurasi module

Project menggunakan Node.js dan ESM.

---

"lib/"

Berisi library/helper yang digunakan oleh berbagai bagian project.

---

"src/"

Berisi source code tambahan/core yang digunakan project.

---

"json/"

Berisi data JSON yang digunakan oleh fitur bot.

---

"media/"

Berisi media yang digunakan oleh bot.

---

"tmp/"

Digunakan untuk file sementara.

---

"thumbnail.jpg"

Thumbnail atau gambar yang digunakan oleh project.

---

🧩 Struktur Plugin

Fitur bot dikelompokkan berdasarkan kategori.

Contoh:

plugins/
│
├── ai/
│   ├── ai.js
│   ├── chat.js
│   └── ...
│
├── anime/
│   ├── anime.js
│   └── ...
│
├── downloader/
│   ├── tiktok.js
│   ├── youtube.js
│   ├── instagram.js
│   └── ...
│
├── game/
│   ├── tebak.js
│   └── ...
│
├── group/
│   ├── kick.js
│   ├── promote.js
│   └── ...
│
├── search/
│   ├── google.js
│   ├── pinterest.js
│   └── ...
│
├── sound/
│   └── ...
│
├── sticker/
│   └── ...
│
├── tools/
│   ├── qr.js
│   ├── ssweb.js
│   └── ...
│
└── voice/
    └── ...

Setiap folder berisi plugin berdasarkan fungsi masing-masing.

---

🧱 Format Plugin

Plugin menggunakan ES Module (ESM).

Contoh plugin sederhana:

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Masukkan teks.\n\nContoh:\n${usedPrefix + command} halo`
    )
  }

  await m.reply(`Input: ${text}`)
}

handler.help = ['contoh']
handler.tags = ['tools']
handler.command = ['contoh']

export default handler

File dapat diletakkan misalnya:

plugins/tools/contoh.js

Kemudian restart bot.

---

🔍 Parameter Handler

Handler dapat menerima berbagai parameter.

Contoh:

const handler = async (
  m,
  {
    conn,
    text,
    args,
    usedPrefix,
    command
  }
) => {

Parameter| Fungsi
"m"| Object pesan
"conn"| Connection WhatsApp
"text"| Text setelah command
"args"| Argument command
"usedPrefix"| Prefix yang digunakan
"command"| Command yang dipanggil

---

🏷️ Metadata Plugin

"handler.help"

Menentukan command yang ditampilkan pada menu/help.

handler.help = ['sticker']

Bisa juga:

handler.help = ['play <query>']

---

"handler.tags"

Menentukan kategori plugin.

handler.tags = ['tools']

Contoh:

handler.tags = ['downloader']

---

"handler.command"

Menentukan command yang dapat digunakan.

handler.command = ['sticker']

Multiple command:

handler.command = ['sticker', 's']

Pengguna dapat menjalankan:

.sticker

atau:

.s

---

🔐 Owner Plugin

Plugin yang hanya dapat digunakan owner dapat menggunakan:

handler.owner = true

Contoh:

const handler = async (m) => {
  await m.reply('Owner feature.')
}

handler.help = ['ownerfeature']
handler.tags = ['owner']
handler.command = ['ownerfeature']
handler.owner = true

export default handler

---

👥 Group Plugin

Command khusus grup:

handler.group = true

Contoh:

const handler = async (m) => {
  await m.reply('Command ini hanya dapat digunakan di grup.')
}

handler.help = ['group']
handler.tags = ['group']
handler.command = ['group']
handler.group = true

export default handler

---

👮 Admin Plugin

Command khusus admin grup:

handler.group = true
handler.admin = true

Contoh:

const handler = async (m) => {
  await m.reply('Fitur khusus admin.')
}

handler.help = ['admin']
handler.tags = ['group']
handler.command = ['admin']
handler.group = true
handler.admin = true

export default handler

---

📥 Plugin Dengan Text

Contoh:

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `Masukkan teks.\n\nContoh:\n${usedPrefix + command} hello`
    )
  }

  await m.reply(`Teks: ${text}`)
}

handler.help = ['echo <text>']
handler.tags = ['tools']
handler.command = ['echo']

export default handler

Penggunaan:

.echo hello

---

🌐 Plugin Menggunakan API

Contoh menggunakan Axios:

import axios from 'axios'

const handler = async (m, { text }) => {
  if (!text) return m.reply('Masukkan query.')

  try {
    const { data } = await axios.get(
      'https://example.com/api/search',
      {
        params: {
          q: text
        },
        timeout: 20000
      }
    )

    await m.reply(
      JSON.stringify(data, null, 2)
    )

  } catch (error) {
    console.error(error)
    await m.reply('Terjadi kesalahan saat mengakses API.')
  }
}

handler.help = ['search <query>']
handler.tags = ['search']
handler.command = ['search']

export default handler

Install dependency:

npm install axios

---

🖼️ Plugin Media

Contoh menerima gambar:

const handler = async (m, { conn }) => {
  const quoted = m.quoted || m

  if (!quoted?.msg?.mimetype?.startsWith('image/')) {
    return m.reply('Reply atau kirim gambar.')
  }

  const media = await quoted.download()

  await conn.sendMessage(
    m.chat,
    {
      image: media,
      caption: 'Berhasil menerima gambar.'
    },
    {
      quoted: m
    }
  )
}

handler.help = ['image']
handler.tags = ['tools']
handler.command = ['image']

export default handler

---

⚡ Plugin Custom Message

Untuk fitur yang diproses berdasarkan isi pesan tertentu, implementasinya mengikuti sistem handler yang digunakan oleh source.

Contoh konsep:

const handler = async (m) => {
  if (m.text?.toLowerCase() === 'ping') {
    await m.reply('Pong!')
  }
}

handler.customPrefix = /^(ping)$/i
handler.command = new RegExp

export default handler

---

📦 Dependency Plugin

Jika plugin membutuhkan package tambahan, install dari root project.

Contoh:

npm install axios

Kemudian gunakan:

import axios from 'axios'

Jangan install dependency dari dalam folder plugin.

---

🧪 Testing Plugin

Setelah membuat plugin:

1. Buat file plugin
2. Masukkan ke kategori yang sesuai
3. Cek syntax
4. Restart bot
5. Jalankan command
6. Periksa terminal jika terjadi error

Cek syntax:

node --check plugins/tools/contoh.js

---

🔄 Alur Plugin

WhatsApp Message
       │
       ▼
    Handler
       │
       ▼
Command Parser
       │
       ▼
Plugin Loader
       │
       ▼
plugins/<category>/<plugin>.js
       │
       ▼
   handler()
       │
       ▼
WhatsApp Response

Sistem ini membuat fitur dapat dikembangkan secara modular tanpa harus mengubah seluruh core bot.

---

📋 Contoh Command

Sticker

.sticker

TikTok

.tiktok https://vt.tiktok.com/xxxx

Instagram

.ig https://www.instagram.com/p/xxxx

YouTube / Play

.play judul lagu

AI

.ai rekomendasi anime romance

Game

.truth
.dare
.tebakgambar

Menu

.menu
.menu all
.menu tags

«Command dapat berubah mengikuti plugin yang tersedia pada repository.»

---

📦 Requirements

Sebelum menjalankan bot, pastikan sudah tersedia:

- Node.js
- npm
- Git
- WhatsApp account
- Internet connection

Cek Node.js:

node -v

Cek npm:

npm -v

Cek Git:

git --version

---

🚀 Installation

Clone repository:

git clone https://github.com/himanackerman/RYO-YAMADA-MD-.git

Masuk ke folder:

cd RYO-YAMADA-MD-

Install dependency:

npm install

---

⚙️ Configuration

Edit:

nano config.js

Sesuaikan konfigurasi seperti:

global.owner = [...]
global.namebot = 'RYO YAMADA MD'
global.packname = '...'
global.author = '...'

Jangan memasukkan token atau password ke dalam source publik.

---

▶️ Menjalankan Bot

Jika project menggunakan "index.js":

node index.js

Jika menggunakan "main.js":

node main.js

Jika terdapat script "start":

npm start

Untuk melihat script yang tersedia:

npm run

---

📱 Termux

Update package:

pkg update
pkg upgrade

Install Node.js:

pkg install nodejs

Install Git:

pkg install git

Clone repository:

git clone https://github.com/himanackerman/RYO-YAMADA-MD-.git

Masuk:

cd RYO-YAMADA-MD-

Install:

npm install

Jalankan:

node index.js

Jika source berada di storage Android:

termux-setup-storage

---

🐳 Docker

Project menyediakan:

Dockerfile
docker-compose.yml

Menjalankan:

docker compose up -d

Melihat container:

docker ps

Melihat log:

docker compose logs -f

Menghentikan:

docker compose down

---

🔄 Update Repository

Jika repository sudah di-clone:

git pull

Update dependency:

npm install

Kemudian restart bot.

Jika melakukan perubahan source sendiri:

git add -A
git commit -m "Update SC"
git push

---

🛠️ Development Workflow

Workflow sederhana:

Create Plugin
     ↓
Test Plugin
     ↓
Fix Error
     ↓
Add Changes
     ↓
Commit
     ↓
Push

Command:

git add -A
git commit -m "Add new plugin"
git push

---

⚠️ Troubleshooting

Cannot find module

Contoh:

Cannot find module 'axios'

Install dependency:

npm install axios

Atau:

npm install

---

Dependency Error

Coba reinstall:

rm -rf node_modules
npm install

---

Syntax Error

Cek file:

node --check nama-file.js

---

Storage Permission Termux

Jalankan:

termux-setup-storage

---

Bot Tidak Merespon

Periksa terminal untuk error.

Restart:

node index.js

Pastikan koneksi internet aktif dan session WhatsApp masih tersedia.

---

🔐 Security

Jangan upload credential ke GitHub.

Contoh informasi yang tidak boleh dipublikasikan:

API KEY
ACCESS TOKEN
PASSWORD
SESSION
PRIVATE KEY
DATABASE PASSWORD
BOT TOKEN

Gunakan environment variable:

const token = process.env.API_TOKEN

Tambahkan file rahasia ke ".gitignore":

.env
session/
auth_info/
node_modules/

Jika secret sudah terlanjur masuk commit, segera revoke credential tersebut dan hapus dari Git history sebelum melakukan push.

---

🤝 Contributing

Pull Request dan kontribusi dipersilakan.

Sebelum mengirim perubahan:

git add -A
git commit -m "Describe your changes"
git push

Pastikan:

- Plugin dapat dijalankan
- Tidak ada secret
- Tidak merusak fitur lain
- Struktur folder tetap rapi
- Dependency baru memang diperlukan

---

❤️ Credits

Base / referensi:

ShirokamiRyzen

Repository:

https://github.com/ShirokamiRyzen/Nao-MD

Terima kasih kepada seluruh developer, contributor, dan komunitas yang membantu perkembangan project WhatsApp bot dan library yang digunakan.

---

📜 License

License project tersedia pada:

LICENSE

Silakan baca file tersebut sebelum menggunakan, memodifikasi, atau mendistribusikan source code.

---

⚠️ Disclaimer

Project ini dibuat untuk pembelajaran, eksperimen, automation, dan penggunaan pribadi.

Penggunaan bot sepenuhnya menjadi tanggung jawab pengguna.

Jangan gunakan bot untuk:

- Spam
- Penipuan
- Penyalahgunaan akun
- Mengganggu pengguna lain
- Aktivitas ilegal
- Melanggar kebijakan layanan WhatsApp
- Aktivitas yang merugikan pihak lain

Gunakan project secara bertanggung jawab.

---

🔗 Links

<p align="center"><a href="https://github.com/himanackerman/RYO-YAMADA-MD-">
  <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github">
</a><a href="https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K">
  <img src="https://img.shields.io/badge/WhatsApp-Channel-25D366?style=for-the-badge&logo=whatsapp">
</a></p>---

<p align="center">
  <b>RYO YAMADA MD</b><br>
  Simple • Fast • Modular • Plugin Based
</p><p align="center">
  Made with Node.js and ❤️
</p>
