import fetch from "node-fetch";
import FormData from "form-data";

async function uploadToCatbox(buffer) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, "file.jpg");

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });

  const url = await res.text();
  if (!url.startsWith("http")) throw new Error("❌ Gagal upload ke Catbox");
  return url.trim();
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || "";

  if (!mime || !/image\/(jpeg|png)/i.test(mime)) {
    return m.reply(`🖼️ Balas gambar JPG/PNG atau kirim gambar dengan caption: ${usedPrefix + command}`);
  }

  m.reply("✨ Sedang memproses HD…");

  try {
    const media = await q.download();
    if (!media) throw new Error("🍂 Gagal download gambar.");

    const imageUrl = await uploadToCatbox(media);

    const apiUrl = `https://api.zenzxz.my.id/tools/upscale?url=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("🍂 Gagal menghubungi API upscale!");

    const json = await res.json();
    if (!json?.status || !json?.result) throw new Error("🍂 Gagal memperbesar resolusi gambar!");

    const resultUrl = json.result;
    const imgRes = await fetch(resultUrl);
    if (!imgRes.ok) throw new Error("🍂 Gagal mengambil hasil gambar dari server.");

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    await conn.sendFile(
      m.chat,
      buffer,
      "hd.png",
      "*✨ Gambar berhasil di-upscale!*\n📈 Resolusi lebih tinggi dari aslinya",
      m
    );
  } catch (e) {
    console.error(e);
    m.reply(`🍂 Ups, gagal upscale gambarnya!\nError: ${e.message}`);
  }
};

handler.help = ["hd2", "hd3", "hd4"];
handler.tags = ["tools"];
handler.command = /^(hd2|hd3|hd4)$/i;
handler.limit = true;
handler.register = true;

export default handler;