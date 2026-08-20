<div align="center">

<img src="https://raw.githubusercontent.com/himanackerman/Image/main/1768265694471-117.jpeg" width="380" style="border-radius:12px"/>

# ⋆｡°✩ RYO YAMADA MD ✩°｡⋆

### 『 WhatsApp Multi-Device Bot 』

*Modular ⋅ Ringan ⋅ Plugin Based*

<br>

![Node](https://img.shields.io/badge/Node.js-v20-a970ff?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=1a1a2e)
![Baileys](https://img.shields.io/badge/Baileys-Multi--Device-ff69b4?style=for-the-badge&logo=whatsapp&logoColor=white&labelColor=1a1a2e)
![License](https://img.shields.io/github/license/himanackerman/RYO-YAMADA-MD-?style=for-the-badge&color=a970ff&labelColor=1a1a2e)

![Stars](https://img.shields.io/github/stars/himanackerman/RYO-YAMADA-MD-?style=flat-square&color=ff69b4&label=%E2%98%86%20Stars&labelColor=1a1a2e)
![Forks](https://img.shields.io/github/forks/himanackerman/RYO-YAMADA-MD-?style=flat-square&color=a970ff&label=%E2%9C%A6%20Forks&labelColor=1a1a2e)

[![WhatsApp Channel](https://img.shields.io/badge/📢_Join_Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K)

<br>

[![Clone Repo](https://img.shields.io/badge/⬇_Clone_Repo-a970ff?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e)](https://github.com/himanackerman/RYO-YAMADA-MD-.git)
[![View Source](https://img.shields.io/badge/📂_View_Source-ff69b4?style=for-the-badge&logo=github&logoColor=white&labelColor=1a1a2e)](https://github.com/himanackerman/RYO-YAMADA-MD-)
[![Report Issue](https://img.shields.io/badge/🐛_Report_Issue-ffd54f?style=for-the-badge&logo=github&logoColor=black&labelColor=1a1a2e)](https://github.com/himanackerman/RYO-YAMADA-MD-/issues)
[![License](https://img.shields.io/github/license/himanackerman/RYO-YAMADA-MD-?style=for-the-badge&color=6fd6ff&label=📜%20License&labelColor=1a1a2e)](https://github.com/himanackerman/RYO-YAMADA-MD-/blob/master/LICENSE)

<br>

[![⚡ Requirements](https://img.shields.io/badge/⚡_Requirements-1a1a2e?style=flat-square&color=2a2a45)](#-requirements)
[![📦 Instalasi](https://img.shields.io/badge/📦_Instalasi-1a1a2e?style=flat-square&color=2a2a45)](#-instalasi)
[![⚙️ Konfigurasi](https://img.shields.io/badge/⚙️_Konfigurasi-1a1a2e?style=flat-square&color=2a2a45)](#-konfigurasi)
[![🧩 Plugin](https://img.shields.io/badge/🧩_Plugin-1a1a2e?style=flat-square&color=2a2a45)](#-struktur-plugin)
[![💾 Saveplugin](https://img.shields.io/badge/💾_Saveplugin-1a1a2e?style=flat-square&color=2a2a45)](#-simpan-plugin-via-chat--saveplugin)
[![⚠️ Troubleshoot](https://img.shields.io/badge/⚠️_Troubleshoot-1a1a2e?style=flat-square&color=2a2a45)](#-troubleshooting)

┊ ┊ ┊ ┊
┊ ┊ ┊ 𖥔
┊ ⊹
✧

</div>

---

## ⊹ ࣪ ˖ Tentang

**RYO YAMADA MD** adalah bot WhatsApp Multi-Device berbasis Node.js & Baileys dengan sistem **plugin modular**. Dibuat untuk hiburan, downloader, AI, sticker, game, dan otomatisasi WhatsApp — semuanya rapi dalam satu ekosistem plugin yang gampang dikembangkan.

<br>

## ✦ Fitur Utama

<div align="center">

| 🌸 | Fitur |
|:---:|---|
| 🤖 | **AI Tools** — chat AI & generator |
| 📥 | **Downloader** — TikTok, IG, YouTube, dll |
| 🎨 | **Sticker Maker** — bikin & olah sticker |
| 🎮 | **Game & Fun** — truth, dare, tebak-tebakan |
| 👥 | **Group Tools** — manajemen grup |
| 🛠️ | **Utility** — converter, QR, tools lainnya |
| 👑 | **Owner Panel** — fitur khusus owner |

</div>

<br>

## ✦ Requirements

```
✧ Node.js v20
✧ npm & Git
✧ Akun WhatsApp
```

<br>

## ✦ Instalasi

```bash
git clone https://github.com/himanackerman/RYO-YAMADA-MD-.git
cd RYO-YAMADA-MD-
npm install
```

<br>

## ✦ Konfigurasi

Edit `config.js`:

```js
global.owner = [...]
global.namebot = 'RYO YAMADA MD'
global.pairing = '628xxxxxxxxxx'   // isi nomor WhatsApp buat pairing code
```

> ⚠️ *Jangan taruh token atau password di source publik ya~*

<br>

## ✦ Menjalankan Bot

```bash
npm install
node index.js
```

atau kalau ada script start:

```bash
npm install
npm start
```

<br>

## ⊹ ࣪ ˖ Struktur Plugin

Setiap fitur tersimpan rapi berdasarkan kategori di `plugins/`:

<div align="center">

`ai` `anime` `anu` `audio` `downloader` `fun` `game` `group`
`image` `info` `internet` `main` `maker` `nsfw` `owner` `panel`
`quotes` `quran` `random` `rpg` `search` `sound` `stalk`
`sticker` `store` `tools` `voice`

</div>

Contoh plugin sederhana — simpan di `plugins/<kategori>/nama.js`:

```js
const handler = async (m, { text }) => {
  await m.reply(`Input: ${text}`)
}

handler.help = ['contoh']
handler.tags = ['tools']
handler.command = ['contoh']

export default handler
```

*Restart bot setelah nambah plugin baru ✧*

<br>

## ✦ Simpan Plugin via Chat ⋅ `saveplugin`

Command: `.saveplugin` · `.sf` · `.sp` — **khusus owner** 👑

**Reply** pesan berisi kode plugin, lalu ketik:

```
.saveplugin <nama-file>
```

<table>
<tr><td>

```
.saveplugin owner
```

</td><td>➜ tersimpan di <code>plugins/owner/owner.js</code></td></tr>
<tr><td>

```
.saveplugin ai/mychat.js
```

</td><td>➜ tersimpan sesuai path custom</td></tr>
<tr><td>

```
.saveplugin ai-mychat.js
```

</td><td>➜ prefix <code>ai-</code> auto masuk folder <code>ai/</code></td></tr>
</table>

Kode dicek syntax-nya dulu sebelum disimpan — kalau error, bot balas errornya dan file **tidak** tersimpan.

> ✧ Untuk file di luar `plugins/` (misal update `main.js`), pakai `.savefile <nama-file>` dengan cara yang sama.

<br>

## ✦ Contoh Command

```
.sticker
.tiktok <link>
.ig <link>
.play judul lagu
.ai <prompt>
.menu
```

<br>

## ⊹ ࣪ ˖ Troubleshooting

| Masalah | Solusi |
|:---|:---|
| `Cannot find module` | `npm install` |
| Error tidak jelas | Cek log di terminal |
| Bot tidak merespon | Restart bot, cek koneksi & session WhatsApp |

<br>

## ✦ Security

> Jangan upload API key, token, password, atau session ke repository publik.
> Simpan di `.env` dan tambahkan ke `.gitignore` ✧

<br>

## ✦ Credits

Base ⋅ **ShirokamiRyzen** — [Nao-MD](https://github.com/ShirokamiRyzen/Nao-MD)

<br>

## ⊹ ࣪ ˖ Disclaimer

Project ini dibuat untuk pembelajaran dan penggunaan pribadi. Jangan gunakan untuk spam, penipuan, atau aktivitas yang melanggar kebijakan WhatsApp.

<br>

<div align="center">

✧ ┄┄┄┄┄┄┄┄ ⋆ ✩ ⋆ ┄┄┄┄┄┄┄┄ ✧

**RYO YAMADA MD**
*Simple ⋅ Fast ⋅ Modular*

made with Node.js and ❤

</div>
