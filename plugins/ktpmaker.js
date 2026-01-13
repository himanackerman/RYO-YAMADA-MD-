import axios from "axios"
import FormData from "form-data"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!mime) return m.reply(`📸 Kirim atau reply foto dengan caption:
${usedPrefix + command} provinsi|kota|nik|nama|ttl|jenis_kelamin|golongan_darah|alamat|rt/rw|kel/desa|kecamatan|agama|status|pekerjaan|kewarganegaraan|masa_berlaku|terbuat

🧩 Contoh:
${usedPrefix + command} Jawa Barat|Bandung|1234567890123456|Ytta|Bandung 10-10-2007|Laki-laki|A|Jl Acumalaka no.21|002/001|Sukajadi|Sukajadi|Islam|Belum kawin|Pegawai Swasta|WNI|Seumur hidup|01-01-2025`)

  let data = text.split("|")
  if (data.length < 16) return m.reply("⚠️ Format tidak lengkap! Harus ada 16 data dipisah tanda `|`")

  m.reply("⏳ Sedang membuat KTP kamu...")

  try {
    let media = await q.download()
    let form = new FormData()
    form.append("provinsi", data[0])
    form.append("kota", data[1])
    form.append("nik", data[2])
    form.append("nama", data[3])
    form.append("ttl", data[4])
    form.append("jenis_kelamin", data[5])
    form.append("golongan_darah", data[6])
    form.append("alamat", data[7])
    form.append("rt/rw", data[8])
    form.append("kel/desa", data[9])
    form.append("kecamatan", data[10])
    form.append("agama", data[11])
    form.append("status", data[12])
    form.append("pekerjaan", data[13])
    form.append("kewarganegaraan", data[14])
    form.append("masa_berlaku", data[15])
    form.append("terbuat", data[16] || "")
    form.append("pas_photo", media, { filename: "photo.jpg" })

    let res = await axios.post("https://fathurweb.qzz.io/api/canvas/ktp", form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer"
    })

    await conn.sendMessage(m.chat, { image: res.data, caption: `✅ KTP Berhasil dibuat!` }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal membuat KTP! Pastikan format benar dan foto valid.")
  }
}

handler.help = ["ktp"]
handler.tags = ["maker"]
handler.command = /^ktp$/i
handler.limit = true

export default handler