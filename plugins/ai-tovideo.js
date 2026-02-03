import axios from "axios";
import fs from "fs";
import path from "path";

const BASE = "https://luca115-wan2-2-5b-fast-t2v-i2v-t2i.hf.space";
const UA =
  "Mozilla/5.0 (Android 12; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0";

/* =========================
   CORE FUNCTIONS
========================= */
async function joinQueue(prompt, session_hash) {
  const url = `${BASE}/gradio_api/queue/join`;

  const payload = {
    data: [
      prompt,
      576,
      1024,
      null,
      "nsfw, naked, watermark, text, signature, worst quality, low quality, blurry",
      5,
      0,
      4,
      Math.floor(Math.random() * 100000),
      true
    ],
    event_data: null,
    fn_index: 2,
    trigger_id: null,
    session_hash
  };

  await axios.post(url, payload, {
    headers: {
      "User-Agent": UA,
      "Referer": "https://upsampler.com/free-video-generator-no-signup"
    }
  });
}

async function waitVideo(session_hash) {
  const url = `${BASE}/gradio_api/queue/data?session_hash=${session_hash}`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent": UA,
      "Referer": "https://upsampler.com/free-video-generator-no-signup"
    },
    responseType: "stream"
  });

  return new Promise((resolve, reject) => {
    let buffer = "";

    res.data.on("data", chunk => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        try {
          const json = JSON.parse(line);

          if (json.msg === "process_completed") {
            const file = json.output.data[0].data;
            resolve(`${BASE}${file}`);
          }

          if (json.msg === "process_failed") {
            reject("Generate video gagal");
          }
        } catch {}
      }
    });

    res.data.on("error", reject);
  });
}

async function downloadVideo(url, filePath) {
  const res = await axios.get(url, {
    headers: { "User-Agent": UA },
    responseType: "stream"
  });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    res.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

/* =========================
   HANDLER FEATURE
========================= */
let handler = async (m, { conn, text }) => {
  if (!text)
    return m.reply(
      "Masukkan prompt videonya.\n\nContoh:\n.tovideo wizard walking in forest cinematic"
    );

  const session_hash = Math.random().toString(36).slice(2);
  const out = path.join(process.cwd(), `${session_hash}.mp4`);

  try {
    await m.reply("🎥 Video sedang dibuat, tunggu sebentar...");

    await joinQueue(text, session_hash);
    const videoUrl = await waitVideo(session_hash);
    await downloadVideo(videoUrl, out);

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(out),
        caption: "✅ Video berhasil dibuat"
      },
      { quoted: m }
    );

    fs.unlinkSync(out);
  } catch (e) {
    console.error(e);
    m.reply("❌ Gagal membuat video.");
  }
};

handler.help = ["tovideo <prompt>"];
handler.tags = ["ai"];
handler.command = /^tovideo$/i;

export default handler;